import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon } from '@openedx/paragon';
import { ExpandMore } from '@openedx/paragon/icons';

import { findSelectOptionLabel } from './selectOptionsUtils';

const TYPEAHEAD_RESET_MS = 800;

function normalizeSearchLabel(label) {
  return String(label ?? '').trim().toLocaleLowerCase();
}

function findOptionIndexByPrefix(options, prefix, startIndex = -1) {
  if (!prefix) {
    return -1;
  }
  const normalizedPrefix = prefix.toLocaleLowerCase();
  for (let i = startIndex + 1; i < options.length; i += 1) {
    if (normalizeSearchLabel(options[i].label).startsWith(normalizedPrefix)) {
      return i;
    }
  }
  for (let i = 0; i <= startIndex; i += 1) {
    if (normalizeSearchLabel(options[i].label).startsWith(normalizedPrefix)) {
      return i;
    }
  }
  return -1;
}

function valuesEqual(a, b) {
  // eslint-disable-next-line eqeqeq
  return a == b;
}

const RobboSelect = ({
  id,
  name,
  value,
  onChange,
  menuItems,
  disabled,
  readOnly,
  className,
  placeholder,
  isInvalid,
  'data-hj-suppress': dataHjSuppress,
}) => {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const optionRefs = useRef([]);
  const typeaheadRef = useRef({
    prefix: '',
    lastChar: '',
    lastMatchIndex: -1,
    timer: null,
  });

  const selectableOptions = useMemo(
    () => menuItems.filter((item) => item.type === 'option' && !item.disabled),
    [menuItems],
  );

  const selectedLabel = useMemo(
    () => findSelectOptionLabel(menuItems, value),
    [menuItems, value],
  );

  const displayLabel = selectedLabel.trim() ? selectedLabel : (placeholder || '');

  const resetTypeahead = useCallback(() => {
    const state = typeaheadRef.current;
    if (state.timer) {
      clearTimeout(state.timer);
      state.timer = null;
    }
    state.prefix = '';
    state.lastChar = '';
    state.lastMatchIndex = -1;
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
    resetTypeahead();
  }, [resetTypeahead]);

  const openMenu = useCallback((initialIndex) => {
    if (disabled || readOnly) {
      return;
    }
    if (typeof initialIndex === 'number') {
      setHighlightedIndex(initialIndex);
    } else {
      const selectedIndex = selectableOptions.findIndex((option) => valuesEqual(option.value, value));
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
    setOpen(true);
  }, [disabled, readOnly, selectableOptions, value]);

  const applyTypeahead = useCallback((char) => {
    const state = typeaheadRef.current;
    if (state.timer) {
      clearTimeout(state.timer);
    }
    state.timer = setTimeout(() => {
      resetTypeahead();
    }, TYPEAHEAD_RESET_MS);

    const isSameCharRepeat = char.toLocaleLowerCase() === state.lastChar.toLocaleLowerCase()
      && state.prefix.length === 1
      && state.prefix.toLocaleLowerCase() === char.toLocaleLowerCase();

    const nextPrefix = isSameCharRepeat ? state.prefix : `${state.prefix}${char}`;
    const startFrom = isSameCharRepeat ? state.lastMatchIndex : -1;
    const matchIndex = findOptionIndexByPrefix(selectableOptions, nextPrefix, startFrom);

    if (matchIndex < 0) {
      return;
    }

    state.prefix = nextPrefix;
    state.lastChar = char;
    state.lastMatchIndex = matchIndex;
    setHighlightedIndex(matchIndex);
  }, [resetTypeahead, selectableOptions]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [closeMenu, open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const highlightedOption = optionRefs.current[highlightedIndex];
    if (highlightedOption) {
      highlightedOption.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, open]);

  const emitChange = (nextValue) => {
    if (onChange) {
      onChange({ target: { name, value: nextValue } });
    }
  };

  const handleToggle = () => {
    if (disabled || readOnly) {
      return;
    }
    if (open) {
      closeMenu();
      return;
    }
    openMenu();
  };

  const handleSelect = (optionValue) => {
    emitChange(optionValue);
    closeMenu();
  };

  const handleKeyDown = (event) => {
    if (disabled || readOnly) {
      return;
    }

    const { key } = event;

    if (key === 'Escape') {
      if (open) {
        event.preventDefault();
        closeMenu();
      }
      return;
    }

    if (key === 'ArrowDown') {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      setHighlightedIndex((prev) => Math.min(prev + 1, selectableOptions.length - 1));
      return;
    }

    if (key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (key === 'Enter' || key === ' ') {
      if (!open) {
        event.preventDefault();
        openMenu();
        return;
      }
      if (key === 'Enter') {
        event.preventDefault();
        const highlighted = selectableOptions[highlightedIndex];
        if (highlighted) {
          handleSelect(highlighted.value);
        }
      }
      return;
    }

    if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      if (!open) {
        setOpen(true);
      }
      applyTypeahead(key);
    }
  };

  const optionIdPrefix = id || name || 'robbo-select';
  let selectableIndex = -1;

  return (
    <div
      ref={containerRef}
      className={classNames('robbo-select', className, {
        'robbo-select--open': open,
        'robbo-select--disabled': disabled || readOnly,
        'robbo-select--invalid': isInvalid,
      })}
      data-hj-suppress={dataHjSuppress || undefined}
    >
      {name != null && (
        <input type="hidden" name={name} value={value ?? ''} readOnly />
      )}
      <button
        type="button"
        id={id}
        className="robbo-select__trigger"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled || readOnly}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={isInvalid || undefined}
        aria-activedescendant={
          open && selectableOptions[highlightedIndex]
            ? `${optionIdPrefix}-option-${selectableOptions[highlightedIndex].value}`
            : undefined
        }
      >
        <span
          className={classNames('robbo-select__value', {
            'robbo-select__value--placeholder': !selectedLabel.trim(),
          })}
        >
          {displayLabel}
        </span>
        <Icon className="robbo-select__arrow" src={ExpandMore} />
      </button>
      {open && (
        <ul className="robbo-select__menu" role="listbox" aria-labelledby={id}>
          {menuItems.map((item, index) => {
            if (item.type === 'group') {
              return (
                <li
                  key={`group-${item.label}-${index}`}
                  className="robbo-select__group"
                  role="presentation"
                >
                  <span className="robbo-select__group-label">{item.label}</span>
                </li>
              );
            }

            if (item.disabled) {
              return (
                <li
                  key={`disabled-${item.value}-${index}`}
                  className="robbo-select__option robbo-select__option--disabled"
                  role="presentation"
                >
                  <span className="robbo-select__option-button">{item.label}</span>
                </li>
              );
            }

            selectableIndex += 1;
            const currentSelectableIndex = selectableIndex;
            const isSelected = valuesEqual(item.value, value);
            const isHighlighted = currentSelectableIndex === highlightedIndex;

            return (
              <li
                key={`${item.value}-${index}`}
                id={`${optionIdPrefix}-option-${item.value}`}
                ref={(element) => {
                  optionRefs.current[currentSelectableIndex] = element;
                }}
                className={classNames('robbo-select__option', {
                  'robbo-select__option--highlighted': isHighlighted,
                })}
                role="option"
                aria-selected={isSelected}
              >
                <button
                  type="button"
                  className="robbo-select__option-button"
                  onMouseEnter={() => setHighlightedIndex(currentSelectableIndex)}
                  onClick={() => handleSelect(item.value)}
                >
                  <span className="robbo-select__option-label">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

RobboSelect.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  menuItems: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.oneOf(['group', 'option']).isRequired,
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    disabled: PropTypes.bool,
  })).isRequired,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  isInvalid: PropTypes.bool,
  'data-hj-suppress': PropTypes.bool,
};

RobboSelect.defaultProps = {
  id: undefined,
  name: undefined,
  value: '',
  onChange: null,
  disabled: false,
  readOnly: false,
  className: '',
  placeholder: '',
  isInvalid: false,
  'data-hj-suppress': false,
};

export default RobboSelect;
