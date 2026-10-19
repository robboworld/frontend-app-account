import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { fireEvent, render, screen } from '@testing-library/react';
import configureStore from 'redux-mock-store';

import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';

import EditableSelectField from '../EditableSelectField';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

jest.mock('@edx/frontend-platform/auth');
jest.mock('../data/selectors', () => jest.fn().mockImplementation(() => ({ certPreferenceSelector: () => ({}) })));

const IntlEditableSelectField = injectIntl(EditableSelectField);

const mockStore = configureStore();

describe('EditableSelectField', () => {
  let props = {};
  let store = {};

  const reduxWrapper = children => (
    <Router>
      <IntlProvider locale="en">
        <Provider store={store}>{children}</Provider>
      </IntlProvider>
    </Router>
  );

  beforeEach(() => {
    store = mockStore();
    props = {
      name: 'testField',
      label: 'Main Label',
      emptyLabel: 'Empty Main Label',
      type: 'text',
      value: 'Test Field',
      userSuppliedValue: '',
      options: [
        {
          label: 'Default Option',
          value: 'defaultOption',
        },
        {
          label: 'User Options',
          group: [
            {
              label: 'Suboption 1',
              value: 'suboption1',
            },
          ],
        },
        {
          label: 'Other Options',
          group: [
            {
              label: 'Suboption 2',
              value: 'suboption2',
            },
            {
              label: 'Suboption 3',
              value: 'suboption3',
            },
          ],
        },
      ],
      saveState: 'default',
      error: '',
      confirmationMessageDefinition: {
        id: 'confirmationMessageId',
        defaultMessage: 'Default Confirmation Message',
        description: 'Description of the confirmation message',
      },
      confirmationValue: 'Confirmation Value',
      helpText: 'Helpful Text',
      isEditing: false,
      isEditable: true,
      isGrayedOut: false,
    };
  });

  afterEach(() => jest.clearAllMocks());

  it('renders EditableSelectField correctly with editing disabled', () => {
    const tree = renderer.create(reduxWrapper(<IntlEditableSelectField {...props} />)).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders EditableSelectField correctly with editing enabled', () => {
    props = {
      ...props,
      isEditing: true,
    };

    const tree = renderer.create(reduxWrapper(<IntlEditableSelectField {...props} />)).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders EditableSelectField with an error', () => {
    const errorProps = {
      ...props,
      error: 'This is an error message',
    };
    const tree = renderer.create(reduxWrapper(<IntlEditableSelectField {...errorProps} />)).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders selectOptions when option has a group', () => {
    const propsWithGroup = {
      ...props,
      options: [
        {
          label: 'User Options',
          group: [
            {
              label: 'Suboption 1',
              value: 'suboption1',
            },
          ],
        },
      ],
    };
    const tree = renderer.create(reduxWrapper(<IntlEditableSelectField {...propsWithGroup} />)).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders selectOptions when option does not have a group', () => {
    const propsWithoutGroup = {
      ...props,
      options: [
        {
          label: 'Default Option',
          value: 'defaultOption',
        },
      ],
    };
    const tree = renderer.create(reduxWrapper(<IntlEditableSelectField {...propsWithoutGroup} />)).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders selectOptions with multiple groups', () => {
    const propsWithGroups = {
      ...props,
      options: [
        {
          label: 'Mixed Options',
          group: [
            {
              label: 'Suboption 1',
              value: 'suboption1',
            },
            {
              label: 'Suboption 2',
              value: 'suboption2',
            },
          ],
        },
      ],
    };
    const tree = renderer.create(reduxWrapper(<IntlEditableSelectField {...propsWithGroups} />)).toJSON();
    expect(tree).toMatchSnapshot();
  });

  // Robbo: type="select" is RobboSelect, not a native select — the value goes to the form in a hidden input,
  // options and their groups are in the menu.
  it('renders RobboSelect with option groups for type select', () => {
    // jsdom has no scrollIntoView; RobboSelect scrolls the highlighted option into view on open.
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    const { container } = render(reduxWrapper(
      <IntlEditableSelectField {...props} type="select" value="suboption2" isEditing />,
    ));

    expect(container.querySelector('input[type="hidden"][name="testField"]')).toHaveValue('suboption2');
    const trigger = container.querySelector('#field-testField');
    expect(trigger).toHaveTextContent('Suboption 2');

    fireEvent.click(trigger);
    expect(screen.getByText('User Options')).toBeInTheDocument();
    expect(screen.getByText('Other Options')).toBeInTheDocument();
    const options = screen.getAllByRole('option');
    expect(options.map(option => option.textContent)).toEqual(
      ['Default Option', 'Suboption 1', 'Suboption 2', 'Suboption 3'],
    );
    expect(options[2]).toHaveAttribute('aria-selected', 'true');
  });
});
