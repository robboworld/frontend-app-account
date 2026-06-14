/**
 * Flatten EditableSelectField options (incl. optgroups) for RobboSelect.
 */
export function flattenEditableSelectOptions(options) {
  const items = [];

  options.forEach((option) => {
    if (option.group) {
      items.push({
        type: 'group',
        label: String(option.label ?? ''),
      });
      option.group.forEach((subOption) => {
        items.push({
          type: 'option',
          value: subOption.value,
          label: String(subOption.label ?? ''),
          disabled: Boolean(subOption.disabled),
        });
      });
      return;
    }

    items.push({
      type: 'option',
      value: option.value,
      label: String(option.label ?? ''),
      disabled: Boolean(option.disabled),
    });
  });

  return items;
}

export function findSelectOptionLabel(menuItems, value) {
  const match = menuItems.find(
    (item) => item.type === 'option' && !item.disabled && item.value == value, // eslint-disable-line eqeqeq
  );
  return match?.label ?? '';
}
