import React from 'react';
import ResultsCodeBlock, { ResultsCodeBlock as OriginalCodeBlock } from '../ResultsCodeBlock';
import { shallow } from 'enzyme';
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

describe('tests for the result code block component', () => {
    //Dummy files
    const emptyFile = new File([], "empty.txt", {
        type: "text/plain",
    });
    const parts = [
        new Blob(['Hello world'], { type: 'text/plain' })
    ];
    const file = new File(parts, 'sample.txt', {});

    const multiparts = [
        new Blob(['hello world'], { type: 'text/plain' }),
        new Blob(['goodbye world'], { type: 'text/plain' }),
        new Blob(['good afternoon world'], { type: 'text/plain' })

    ];
    const multifile = new File(parts, 'sample.txt', {});

    //Test props
    var emptyProps = {
        currentFile: emptyFile,
        highlightedLines: [],
        activeLines: [],
        test: [],
        lineDataCallback: ((fileName: string, lineNumber: number) => undefined),
    };
    var lineProps = {
        currentFile: file,
        highlightedLines: [],
        activeLines: [],
        test: [],
        lineDataCallback: ((fileName: string, lineNumber: number) => undefined),
    };
    var multiProps = {
        currentFile: file,
        highlightedLines: [],
        activeLines: [],
        test: [],
        lineDataCallback: ((fileName: string, lineNumber: number) => undefined),
    };

    var highlightedProps = {
        currentFile: file,
        highlightedLines: [[1, 3], [6, 6]],
        activeLines: [],
        lineDataCallback: ((fileName: string, lineNumber: number) => undefined),
        test: [],
    };
    var activeProps = {
        currentFile: file,
        highlightedLines: [],
        activeLines: [[1, 2], [5, 5]],
        lineDataCallback: ((fileName: string, lineNumber: number) => undefined),
        test: [],
    };

    //Test state lists
    const codeLinesNone: string[] = [];
    const codeLines1: string[] = ["Hello world"];
    const codeLines3: string[] = ["Hello world", "goodbye world", "good afternoon world"];
    const codeLines6: string[] = ["Hello world", "goodbye world", "good afternoon world", "lonely", "five", "six"];

    it('should have no code line occurences given an empty file', () => {
        const wrapper = shallow(<ResultsCodeBlock {...emptyProps} />);
        const component = wrapper.find(OriginalCodeBlock).dive();
        const readAsTextSpy = jest.spyOn(FileReader.prototype, 'readAsText');
        expect(readAsTextSpy, "expect readAsText to not be called").toHaveBeenCalledTimes(0);

        component.setState({ currentFileStringList: codeLinesNone });
        expect(component.find('#code-line')).toHaveLength(0);
    });

    it('should have 1 code line occurences given an single stringed file', () => {
        const readAsTextSpy = jest.spyOn(FileReader.prototype, 'readAsText');
        const wrapper = shallow(<ResultsCodeBlock {...lineProps} />);
        const component = wrapper.find(OriginalCodeBlock).dive();
        expect(readAsTextSpy, "expect readAsText to be called").toBeCalledWith(file);
        component.setState({ currentFileStringList: codeLines1 });
        expect(component.find('#code-line'), "check if code line size is correct").toHaveLength(1);
        expect(component.find('#code-line').text(), "correct content of code line").toBe("1Hello world");
    });

    it('should have multiple code line occurences given an multiple lined file', () => {
        const wrapper = shallow(<ResultsCodeBlock {...multiProps} />);
        const component = wrapper.find(OriginalCodeBlock).dive();
        const readAsTextSpy = jest.spyOn(FileReader.prototype, 'readAsText');
        expect(readAsTextSpy, "expect readAsText to be called").toBeCalledWith(multifile);
        component.setState({ currentFileStringList: codeLines3 });
        expect(component.find('#code-line'), "check if code line size is correct").toHaveLength(3);
        expect(component.find('#code-line').at(0).text(), "correct content of code line 1").toBe("1Hello world");
        expect(component.find('#code-line').at(1).text(), "correct content of code line 2").toBe("2goodbye world");
        expect(component.find('#code-line').at(2).text(), "correct content of code line 3").toBe("3good afternoon world");
    });

    it('should have highlighted code in red', () => {
        const wrapper = shallow(<ResultsCodeBlock {...highlightedProps} />);
        const component = wrapper.find(OriginalCodeBlock).dive();
        component.setState({ currentFileStringList: codeLines6 });
        expect(component.find('#code-line'), "check if code line size is correct").toHaveLength(6);
        expect(component.find('.highlighted'), "check if red highlighted lines size is correct").toHaveLength(4);
        expect(component.find('#code-line').at(0).hasClass("highlighted"), "check if line 1 is highlighted red").toBe(true);
        expect(component.find('#code-line').at(1).hasClass("highlighted"), "check if line 2 is highlighted red").toBe(true);
        expect(component.find('#code-line').at(2).hasClass("highlighted"), "check if line 3 is highlighted red").toBe(true);
        expect(component.find('#code-line').at(5).hasClass("highlighted"), "check if line 6 is highlighted red").toBe(true);
    });


    it('if you click on a highlighted line it will send index back to parent', () => {
        const updateLineCallBack = jest.fn((name: string, index: number) => { });
        const wrapper = shallow(<ResultsCodeBlock {...highlightedProps} lineDataCallback={updateLineCallBack} />);
        const component = wrapper.find(OriginalCodeBlock).dive();
        component.setState({ currentFileStringList: codeLines6 });
        expect(component.find('#code-line'), "check if code line size is correct").toHaveLength(6);
        component.find('#code-line').at(0).simulate('click');
        expect(updateLineCallBack, "if function to call back has been called").toHaveBeenCalledTimes(1);
        expect(updateLineCallBack.mock.calls[0][0], "if file name parameter is sent back").toBe("sample.txt");
        expect(updateLineCallBack.mock.calls[0][1], "if line number is sent back").toBe(1);
    });

    it('if you click on a non highlighted line it will do nothing', () => {
        const updateLineCallBack = jest.fn();
        const wrapper = shallow(<ResultsCodeBlock {...highlightedProps} lineDataCallback={updateLineCallBack} />);
        const component = wrapper.find(OriginalCodeBlock).dive();
        component.setState({ currentFileStringList: codeLines6 });
        expect(component.find('#code-line'), "check if code line size is correct").toHaveLength(6);
        component.find('#code-line').at(4).simulate('click');
        expect(updateLineCallBack, "check if function wasn't called").toHaveBeenCalledTimes(0);
    });

    it('should have active highlights', () => {
        const updateLineCallBack = jest.fn();
        const wrapper = shallow(<ResultsCodeBlock {...activeProps} lineDataCallback={updateLineCallBack} />);
        const component = wrapper.find(OriginalCodeBlock).dive();
        component.setState({ currentFileStringList: codeLines6 });
        expect(component.find('#code-line'), "check if code line size is correct").toHaveLength(6);
        expect(component.find('.active'), "check if active highlight line size is correct").toHaveLength(3);
        expect(component.find('#code-line').at(0).hasClass("active"), "check if line 1 is highlighted yellow").toBe(true);
        expect(component.find('#code-line').at(1).hasClass("active"), "check if line 2 is highlighted yellow").toBe(true);
        expect(component.find('#code-line').at(4).hasClass("active"), "check if line 5 is highlighted yellow").toBe(true);
    });

    it('should have no red highlights if given no lines', () => {
        const wrapper = shallow(<ResultsCodeBlock {...activeProps} />);
        const component = wrapper.find(OriginalCodeBlock).dive();
        component.setState({ currentFileStringList: codeLines3 });
        expect(component.find('.highlight')).toHaveLength(0);
    });

    it('should have no active highlights if given no lines', () => {
        const wrapper = shallow(<ResultsCodeBlock {...highlightedProps} />);
        const component = wrapper.find(OriginalCodeBlock).dive();
        component.setState({ currentFileStringList: codeLines3 });
        expect(component.find('.active')).toHaveLength(0);
    });
});