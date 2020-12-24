import React from 'react';
import App from '../App';
import UploadComponent from '../UploadComponent';
import { shallow } from 'enzyme';
import ResultsComponent from '../ResultsComponent';
import { render } from '@testing-library/react';


Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('<App />', () => {
  let component

  beforeEach(() => {
    component = shallow(<App />)
  })
  test('It should mount', () => {
    expect(component.length).toBe(1)
  })

  test('App snapshot is rendered properly.', () => {
    const wrapper = render(<App />)
    expect(wrapper).toMatchSnapshot();
  })

  test('App contains UploadComponent and ResultsComponent', () => {
    const wrapper = shallow(<App />);
    expect(wrapper.contains(<UploadComponent />)).toBeTruthy;
    expect(wrapper.contains(<ResultsComponent />)).toBeTruthy;
  });
})

