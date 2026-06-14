import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';

import { Icon } from '@openedx/paragon';
import { ExpandMore } from '@openedx/paragon/icons';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const TYPEAHEAD_RESET_MS = 800;

function normalizeCountrySearchLabel(label) {
  return String(label ?? '').replace(/\s+\+\d[\d\s-]*$/, '').trim().toLocaleLowerCase();
}

function findOptionIndexByPrefix(options, prefix, startIndex = -1) {
  if (!prefix) {
    return -1;
  }
  const normalizedPrefix = prefix.toLocaleLowerCase();
  for (let i = startIndex + 1; i < options.length; i += 1) {
    if (normalizeCountrySearchLabel(options[i].label).startsWith(normalizedPrefix)) {
      return i;
    }
  }
  for (let i = 0; i <= startIndex; i += 1) {
    if (normalizeCountrySearchLabel(options[i].label).startsWith(normalizedPrefix)) {
      return i;
    }
  }
  return -1;
}

const RobboPhoneCountrySelect = ({
  value,
  onChange,
  onFocus,
  onBlur,
  options,
  disabled,
  readOnly,
  className,
  ...rest
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
    () => options.filter((option) => !option.divider),
    [options],
  );

  const selectedOption = useMemo(
    () => selectableOptions.find((option) => {
      if (!value) {
        return !option.value;
      }
      return option.value === value;
    }),
    [selectableOptions, value],
  );

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
    if (onBlur) {
      onBlur();
    }
  }, [onBlur, resetTypeahead]);

  const openMenu = useCallback((initialIndex) => {
    if (disabled || readOnly) {
      return;
    }
    if (typeof initialIndex === 'number') {
      setHighlightedIndex(initialIndex);
    } else {
      const selectedIndex = selectableOptions.findIndex((option) => {
        if (!value) {
          return !option.value;
        }
        return option.value === value;
      });
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

  const handleSelect = (countryValue) => {
    onChange(countryValue || undefined);
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

  return (
    <div
      ref={containerRef}
      className={classNames('robbo-phone-country', className, {
        'robbo-phone-country--open': open,
      })}
    >
      <button
        type="button"
        className="robbo-phone-country__trigger"
        onClick={handleToggle}
        onFocus={onFocus}
        onKeyDown={handleKeyDown}
        disabled={disabled || readOnly}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-activedescendant={
          open && selectableOptions[highlightedIndex]
            ? `robbo-phone-country-option-${selectableOptions[highlightedIndex].value || 'ZZ'}`
            : undefined
        }
        {...rest}
      >
        <span className="robbo-phone-country__flag" aria-hidden>
          {value ? getUnicodeFlagIcon(value) : '🌐'}
        </span>
        <Icon className="robbo-phone-country__arrow" src={ExpandMore} />
      </button>
      {open && (
        <ul className="robbo-phone-country__menu" role="listbox">
          {selectableOptions.map((option, index) => {
            const optionValue = option.value || 'ZZ';
            const isSelected = value ? option.value === value : !option.value;
            const isHighlighted = index === highlightedIndex;
            return (
              <li
                key={optionValue}
                id={`robbo-phone-country-option-${optionValue}`}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                className={classNames('robbo-phone-country__option', {
                  'robbo-phone-country__option--highlighted': isHighlighted,
                })}
                role="option"
                aria-selected={isSelected}
              >
                <button
                  type="button"
                  className="robbo-phone-country__option-button"
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.value && (
                    <span className="robbo-phone-country__option-flag" aria-hidden>
                      {getUnicodeFlagIcon(option.value)}
                    </span>
                  )}
                  <span className="robbo-phone-country__option-label">{option.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <span className="sr-only">{selectedOption?.label}</span>
    </div>
  );
};

RobboPhoneCountrySelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string,
    divider: PropTypes.bool,
  })).isRequired,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  className: PropTypes.string,
};

RobboPhoneCountrySelect.defaultProps = {
  value: undefined,
  onFocus: null,
  onBlur: null,
  disabled: false,
  readOnly: false,
  className: '',
};

export default RobboPhoneCountrySelect;
