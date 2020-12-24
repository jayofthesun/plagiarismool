import React from 'react';
import ResultsCodeList, { ResultsCodeList as OriginalList } from '../ResultsCodeList';
import { shallow } from 'enzyme';
import 'jest';
import { ListItem, ListItemText } from '@material-ui/core';
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

it('should render results code list correctly with given fields', () => {
    let file = new File([], "cool.ts");
    let file2 = new File([], "coolio.ts");

    const files = [file, file2];
    const component = render(<ResultsCodeList fileList={files} passIndexBack={() => { }} />);
    expect(component).toMatchSnapshot();
});

describe('tests for the result code list component', () => {
    //Dummy files
    const file = new File([], "cool.ts");
    const file2 = new File([], "coolio.ts");
    const file3 = new File([], 'sample.ts', {});

    //Test props
    var emptyProps = {
        fileList: [],
        passIndexBack: ((index: number) => undefined)
    };
    var oneListProps = {
        fileList: [file],
        passIndexBack: ((index: number) => undefined),
    };
    var multipleListProps = {
        fileList: [file, file2, file3],
        passIndexBack: ((index: number) => undefined),
    };

    it('should have no list items if given an empty list', () => {
        const wrapper = shallow(<ResultsCodeList {...emptyProps} />);
        const component = wrapper.find(OriginalList).dive();
        expect(component.find(ListItem), "no item list length").toHaveLength(0);
    });

    it('should have 1 item in the list if given a single item list', () => {
        const wrapper = shallow(<ResultsCodeList {...oneListProps} />);
        const component = wrapper.find(OriginalList).dive();
        expect(component.find(ListItem), "one item list has correct length").toHaveLength(1);
        expect(component.find(ListItemText).props().primary, "1st item in single list has correct name").toBe("cool.ts");
    });

    it('should have multiple items in the list if given a multiple item list', () => {
        const wrapper = shallow(<ResultsCodeList {...multipleListProps} />);
        const component = wrapper.find(OriginalList).dive();
        expect(component.find(ListItem), "multiple list length is correct").toHaveLength(3);
        expect(component.find(ListItemText).at(0).props().primary, "1st list item in multiple list should be correct").toBe("cool.ts");
        expect(component.find(ListItemText).at(1).props().primary, "2nd list item in multiple list should be correct").toBe("coolio.ts");
        expect(component.find(ListItemText).at(2).props().primary, "3rd list item in multiple list should be correct").toBe("sample.ts");
    });

    it('if you click on a highlighted line it will send index back to parent', () => {
        const updateLineCallBack = jest.fn((index: number) => { });
        const wrapper = shallow(<ResultsCodeList {...multipleListProps} passIndexBack={updateLineCallBack} />);
        const component = wrapper.find(OriginalList).dive();
        component.find(ListItem).at(1).simulate('click');
        expect(updateLineCallBack, "see if function to pass call back is called").toHaveBeenCalledTimes(1);
        expect(updateLineCallBack.mock.calls[0][0], "clicking on the second item should pass back correct index").toBe(1);
        component.find(ListItem).at(0).simulate('click');
        expect(updateLineCallBack, "see if function to pass call back is called again").toHaveBeenCalledTimes(2);
        expect(updateLineCallBack.mock.calls[1][0], "clicking on the first item should pass back correct index").toBe(0);
    });
});