import React from 'react';
import ResultsComponent, { ResultsComponent as OriginalComponent } from '../ResultsComponent';
import { Button, ListItem, ListItemText } from '@material-ui/core';
import { mount, ReactWrapper, shallow } from 'enzyme';
import { ResultsCodeList as OriginalCodeList } from '../ResultsCodeList';
import { Router } from 'react-router-dom';
import { MainContext } from '../MainContext';
import axios from "axios";
import { ResultsCodeBlock as OrginalCodeBlock } from '../ResultsCodeBlock';
import { StrategyInstance } from '../enums/StrategyInstance';
import { createMemoryHistory } from 'history'
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

describe('tests for the main result component', () => {
    //Dummy files
    const file = new File(["hello", "oh boy"], "cool.ts");
    const file2 = new File(["coolio"], "coolio.ts");
    const file3 = new File(["sample"], 'sample.ts', {});
    const file4 = new File(["hello", "oh boy"], 'sample2.ts', {});
    const fileList = [[file, file2], [file3, file4]];

    //file contents:
    const file1Text: string[] = [];
    const file2Text: string[] = ["Hello world", "goodbye world", "good afternoon world", "lonely", "five", "six"];
    const file3Text: string[] = ["Hello world", "goodbye world", "good afternoon world"];
    const file4Text: string[] = ["Hello world", "goodbye world", "good afternoon world", "lonely", "five", "six"];

    //main context mock filegroups
    const contextFileGroups = {
        fileGroups: fileList,
        setFileGroups: ((files: File[][]) => undefined)
    }

    //routing mock history
    const history = createMemoryHistory({
        initialEntries: ['/results'],
    });

    //mocking axios
    const mockedAxios = jest.spyOn(axios, 'get');
    let wrapper: ReactWrapper<any, Readonly<{}>, React.Component<{}, {}, any>>;
    let readAsTextSpy: jest.SpyInstance<void, [blob: Blob, encoding?: string | undefined]>;

    beforeEach(() => {
        mockedAxios.mockResolvedValueOnce({
            data: {
                overallPercentPlagarized: 89,
                plagarismInstances:
                    [{
                        avoidanceStrategy: StrategyInstance.movedCode,
                        fileName1: "coolio.ts",
                        fileName2: "sample.ts",
                        startLine1: 3,
                        startLine2: 1,
                        endLine1: 5,
                        endLine2: 2,
                        type1: "MethodDeclaration",
                        type2: "MethodDeclaration"
                    }]
            }
        });

        readAsTextSpy = jest.spyOn(FileReader.prototype, 'readAsText');
        wrapper = mount(<MainContext.Provider value={contextFileGroups}>
            <Router history={history}>
                <ResultsComponent />
            </Router>
        </MainContext.Provider>);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('ResultsComponent snapshot is rendered properly.', () => {
        const component = render(<Router history={history}>
            <ResultsComponent />
        </Router>)
        expect(component).toMatchSnapshot();
    })

    it('starting state with files and strategy is correct', async (done) => {
        setImmediate(() => {
            const component = wrapper.find(OriginalComponent)
            //Check if percentage is correct
            expect(component.find("#percentage").text(), "if percentage is rendered correctly").toBe("89% plagiarized");

            //Check if info column is correct
            expect(component.find("#results-info-message").text(), "if info column has default name").toBe("Please select a portion of highlighted code to view more details!");

            //check if code list 1 is correct
            expect(component.find(OriginalCodeList).at(0).find(ListItem), "if code list 1 has correct filelist length").toHaveLength(2);
            expect(component.find(OriginalCodeList).at(0).find(ListItemText).at(0).props().primary, "if item 1 in codelist 1 has correct name").toBe("cool.ts");
            expect(component.find(OriginalCodeList).at(0).find(ListItemText).at(1).props().primary, "if item 2 in codelist 1 has correct name").toBe("coolio.ts");

            //check if code list 2 is correct
            expect(component.find(OriginalCodeList).at(1).find(ListItem), "if code list 2 has correct filelist length").toHaveLength(2);
            expect(component.find(OriginalCodeList).at(1).find(ListItemText).at(0).props().primary, "if item 1 in codelist 2 has correct name").toBe("sample.ts");
            expect(component.find(OriginalCodeList).at(1).find(ListItemText).at(1).props().primary, "if item 2 in codelist 2 has correct name").toBe("sample2.ts");

            // check if code bodies are correct
            expect(component.find("#file-name-header").at(0).text(), "if current file 1's name is correct").toBe("cool.ts");
            expect(component.find("#file-name-header").at(0).text(), "if current file 1's name is correct").toBe("cool.ts");

            expect(component.find("#file-name-header").at(1).text(), "if current file 2's name is correct").toBe("sample.ts");
            expect(component.find(OrginalCodeBlock), "if there's 2 code blocks").toHaveLength(2);
            expect(readAsTextSpy, "expect both code blocks to get filereader text render").toHaveBeenCalledTimes(2);
            done();
        });
    });

    it('if you click on file in group1 file list the rest of the screen updates accordingly', async (done) => {
        setImmediate(() => {
            const component = wrapper.find(OriginalComponent)
            expect(readAsTextSpy, "expect both code blocks to get filereader text render - preclick").toHaveBeenCalledTimes(2);
            component.find(OriginalCodeList).at(0).find(ListItem).at(1).simulate('click');
            //Check if header is correct
            expect(component.find("#file-name-header").at(0).text(), "check if current file header is correct").toBe("coolio.ts");
            //check if content is updated
            expect(component.find(OrginalCodeBlock), "check if codeblock updated").toHaveLength(2);
            expect(readAsTextSpy, "expect both code blocks to get filereader text render - post click").toHaveBeenCalledTimes(3);
            done();
        });
    });

    it('if you click on file in group2 file list the rest of the screen updates accordingly', async (done) => {
        setImmediate(() => {
            const component = wrapper.find(OriginalComponent)
            expect(readAsTextSpy, "expect both code blocks to get filereader text render - preclick").toHaveBeenCalledTimes(2);

            component.find(OriginalCodeList).at(1).find(ListItem).at(1).simulate('click');
            //Check if header is correct
            expect(component.find("#file-name-header").at(1).text(), "check if current file 2 has correct name").toBe("sample2.ts");
            //check if content is updated
            expect(component.find(OrginalCodeBlock), "check if code block 2 updated").toHaveLength(2);
            expect(readAsTextSpy, "expect both code blocks to get filereader text render - postclick").toHaveBeenCalledTimes(3);

            done();
        });
    });

    it('if you click on a red line in group1 the rest of the screen updates accordingly', async (done) => {
        setImmediate(() => {
            let component = wrapper.find(OriginalComponent)
            //set up files to test
            component.setState({
                currentFiles: [file2, file3]
            })
            component.find(OrginalCodeBlock).at(0).setState({ currentFileStringList: file2Text })
            component.find(OrginalCodeBlock).at(1).setState({ currentFileStringList: file3Text })
            component = component.update();
            //check if this lines are highlighted red
            expect(component.find(OrginalCodeBlock).at(0).find('#code-line'), "check if code line size is correct for pre-clicked component").toHaveLength(6);
            expect(component.find(OrginalCodeBlock).at(0).find('.active'), "check if active lines size is correct for pre-clicked component").toHaveLength(0);
            expect(component.find(OrginalCodeBlock).at(0).find('.highlighted'), "check if red highlighted lines size is correct for pre-clicked component").toHaveLength(3);

            expect(component.find(OrginalCodeBlock).at(1).find('#code-line'), "check if code line size is correct for pre-other component").toHaveLength(3);
            expect(component.find(OrginalCodeBlock).at(1).find('.active'), "check if active lines size is correct for pre-other component").toHaveLength(0);
            expect(component.find(OrginalCodeBlock).at(1).find('.highlighted'), "check if red highlighted lines size is correct for pre-other component").toHaveLength(2);

            //click on a red line
            component.find(OrginalCodeBlock).at(0).find('#code-line').at(2).simulate("click");

            //check if clicked component now has active lines
            expect(component.find(OrginalCodeBlock).at(0).find('.active'), "check if active lines size is correct for clicked component").toHaveLength(3);

            //check if other block line is highlighted
            expect(component.find(OrginalCodeBlock).at(1).find('.active'), "check if active lines size is correct for other componen post click").toHaveLength(2);

            //Check if info column is correct
            expect(component.find("#results-info-message").text()).toBe("We've detected moved code between:Group1/coolio.ts @ 3 –\xa05Group2/sample.ts @ 1 –\xa02");
            done();
        });
    });


    it('if you click on a red line in group1 the rest of the screen updates accordingly', async (done) => {
        setImmediate(() => {
            let component = wrapper.find(OriginalComponent)
            //set up files to test
            component.setState({
                currentFiles: [file2, file3]
            })
            component.find(OrginalCodeBlock).at(0).setState({ currentFileStringList: file2Text })
            component.find(OrginalCodeBlock).at(1).setState({ currentFileStringList: file3Text })
            component = component.update();
            //check if this lines are highlighted red
            expect(component.find(OrginalCodeBlock).at(0).find('#code-line'), "check if code line size is correct for pre-other component").toHaveLength(6);
            expect(component.find(OrginalCodeBlock).at(0).find('.active'), "check if active lines size is correct for pre-other component").toHaveLength(0);
            expect(component.find(OrginalCodeBlock).at(0).find('.highlighted'), "check if red highlighted lines size is correct for pre-other component").toHaveLength(3);

            expect(component.find(OrginalCodeBlock).at(1).find('#code-line'), "check if code line size is correct for pre-clicked component").toHaveLength(3);
            expect(component.find(OrginalCodeBlock).at(1).find('.active'), "check if active lines size is correct for pre-clicked component").toHaveLength(0);
            expect(component.find(OrginalCodeBlock).at(1).find('.highlighted'), "check if red highlighted lines size is correct for pre-clicked component").toHaveLength(2);

            //click on a red line
            component.find(OrginalCodeBlock).at(1).find('#code-line').at(0).simulate("click");

            //check if clicked component now has active lines
            expect(component.find(OrginalCodeBlock).at(1).find('.active'), "check if active lines size is correct for clicked component").toHaveLength(2);

            //check if other block line is highlighted
            expect(component.find(OrginalCodeBlock).at(0).find('.active'), "check if active lines size is correct for other component post click").toHaveLength(3);

            //Check if info column is correct
            expect(component.find("#results-info-message").text()).toBe("We've detected moved code between:Group1/coolio.ts @ 3 –\xa05Group2/sample.ts @ 1 –\xa02");
            done();
        });
    });

    it('if you click on a red line the rest of the screen updates accordingly - hidden other file in 2', async (done) => {
        setImmediate(() => {
            let component = wrapper.find(OriginalComponent)
            //set up files to test
            component.setState({
                currentFiles: [file2, file4]
            })
            component.find(OrginalCodeBlock).at(0).setState({ currentFileStringList: file2Text })
            component.find(OrginalCodeBlock).at(1).setState({ currentFileStringList: file4Text })
            component = component.update();

            //check if this lines are highlighted red
            expect(component.find(OrginalCodeBlock).at(0).find('#code-line'), "check if code line size is correct for pre-click component").toHaveLength(6);
            expect(component.find(OrginalCodeBlock).at(0).find('.active'), "check if active lines size is correct for pre-click component").toHaveLength(0);
            expect(component.find(OrginalCodeBlock).at(0).find('.highlighted'), "check if red highlighted lines size is correct for pre-click component").toHaveLength(3);

            expect(component.find(OrginalCodeBlock).at(1).find('#code-line'), "check if code line size is correct for pre-other component").toHaveLength(6);
            expect(component.find(OrginalCodeBlock).at(1).find('.active'), "check if active lines size is correct for pre-other component").toHaveLength(0);
            expect(component.find(OrginalCodeBlock).at(1).find('.highlighted'), "check if red highlighted lines size is correct for pre-other component").toHaveLength(0);
            expect(component.find("#file-name-header").at(1).text(), "check if preclicked other file header is correct").toBe("sample2.ts");

            //click on a red line
            component.find(OrginalCodeBlock).at(0).find('#code-line').at(2).simulate("click");
            component.find(OrginalCodeBlock).at(1).setState({ currentFileStringList: file3Text })

            //check if clicked component now has active lines
            expect(component.find(OrginalCodeBlock).at(0).find('.active'), "check if active lines size is correct for clicked component").toHaveLength(3);

            //header of other file is updated
            expect(component.find("#file-name-header").at(1).text(), "check if current file header is correct").toBe("sample.ts");

            //check if other block line is highlighted
            expect(component.find(OrginalCodeBlock).at(1).find('.active'), "check if active lines size is correct for other component post click").toHaveLength(2);

            //Check if info column is correct
            expect(component.find("#results-info-message").text()).toBe("We've detected moved code between:Group1/coolio.ts @ 3 –\xa05Group2/sample.ts @ 1 –\xa02");
            done();
        });
    });

    it('if you click on a red line the rest of the screen updates accordingly - hidden other file in 1', async (done) => {
        setImmediate(() => {
            let component = wrapper.find(OriginalComponent)
            //set up files to test
            component.setState({
                currentFiles: [file, file3]
            })
            component.find(OrginalCodeBlock).at(0).setState({ currentFileStringList: file1Text })
            component.find(OrginalCodeBlock).at(1).setState({ currentFileStringList: file3Text })
            component = component.update();

            //check if this lines are highlighted red
            expect(component.find(OrginalCodeBlock).at(0).find('#code-line'), "check if code line size is correct for pre-other component").toHaveLength(0);
            expect(component.find(OrginalCodeBlock).at(0).find('.active'), "check if active lines size is correct for pre-other component").toHaveLength(0);
            expect(component.find(OrginalCodeBlock).at(0).find('.highlighted'), "check if red highlighted lines size is correct for pre-other component").toHaveLength(0);
            expect(component.find("#file-name-header").at(0).text(), "check if preclicked other file header is correct").toBe("cool.ts");


            expect(component.find(OrginalCodeBlock).at(1).find('#code-line'), "check if code line size is correct for pre-clicked component").toHaveLength(3);
            expect(component.find(OrginalCodeBlock).at(1).find('.active'), "check if active lines size is correct for pre-clicked component").toHaveLength(0);
            expect(component.find(OrginalCodeBlock).at(1).find('.highlighted'), "check if red highlighted lines size is correct for pre-clicked component").toHaveLength(2);

            //click on a red line
            component.find(OrginalCodeBlock).at(1).find('#code-line').at(1).simulate("click");
            component.find(OrginalCodeBlock).at(0).setState({ currentFileStringList: file2Text });

            //check if clicked component now has active lines
            expect(component.find(OrginalCodeBlock).at(1).find('.active'), "check if active lines size is correct for clicked component").toHaveLength(2);

            //header of other file is updated
            expect(component.find("#file-name-header").at(0).text(), "check if current file header is correct").toBe("coolio.ts");

            //check if other block line is highlighted
            expect(component.find(OrginalCodeBlock).at(0).find('.active'), "check if active lines size is correct for other component post click").toHaveLength(3);

            //Check if info column is correct
            expect(component.find("#results-info-message").text()).toBe("We've detected moved code between:Group1/coolio.ts @ 3 –\xa05Group2/sample.ts @ 1 –\xa02");
            done();
        });
    });

    it('the case of multiple JSON strategies', async (done) => {
        mockedAxios.mockResolvedValueOnce({
            data: {
                overallPercentPlagarized: 89,
                plagarismInstances:
                    [{
                        avoidanceStrategy: StrategyInstance.movedCode,
                        fileName1: "coolio.ts",
                        fileName2: "sample.ts",
                        startLine1: 3,
                        startLine2: 1,
                        endLine1: 5,
                        endLine2: 2,
                        type1: "MethodDeclaration",
                        type2: "MethodDeclaration"
                    },
                    {
                        avoidanceStrategy: StrategyInstance.movedCode,
                        fileName1: "coolio.ts",
                        fileName2: "sample.ts",
                        startLine1: 1,
                        startLine2: 3,
                        endLine1: 3,
                        endLine2: 3,
                        type1: "MethodDeclaration",
                        type2: "MethodDeclaration"
                    }]
            }
        });
        readAsTextSpy = jest.spyOn(FileReader.prototype, 'readAsText');
        wrapper = mount(<MainContext.Provider value={contextFileGroups}>
            <Router history={history}>
                <ResultsComponent />
            </Router>
        </MainContext.Provider>);

        setImmediate(() => {
            let component = wrapper.find(OriginalComponent)
            //set up files to test
            component.setState({
                currentFiles: [file2, file3]
            })
            component.find(OrginalCodeBlock).at(0).setState({ currentFileStringList: file2Text })
            component.find(OrginalCodeBlock).at(1).setState({ currentFileStringList: file3Text })
            component = component.update();
            //check if this lines are highlighted red
            expect(component.find(OrginalCodeBlock).at(0).find('#code-line'), "check if code line size is correct for pre-clicked component").toHaveLength(6);
            expect(component.find(OrginalCodeBlock).at(0).find('.active'), "check if active lines size is correct for pre-clicked component").toHaveLength(0);
            expect(component.find(OrginalCodeBlock).at(0).find('.highlighted'), "check if red highlighted lines size is correct for pre-clicked component").toHaveLength(5);

            expect(component.find(OrginalCodeBlock).at(1).find('#code-line'), "check if code line size is correct for pre-other component").toHaveLength(3);
            expect(component.find(OrginalCodeBlock).at(1).find('.active'), "check if active lines size is correct for pre-other component").toHaveLength(0);
            expect(component.find(OrginalCodeBlock).at(1).find('.highlighted'), "check if red highlighted lines size is correct for pre-other component").toHaveLength(3);

            //click on a red line - group1(1,3) & group2(3,3)
            component.find(OrginalCodeBlock).at(0).find('#code-line').at(1).simulate("click");
            //check if clicked component now has active lines
            expect(component.find(OrginalCodeBlock).at(0).find('.active'), "check if active lines size is correct for clicked component - 1 click").toHaveLength(3);
            //check if other block line is highlighted
            expect(component.find(OrginalCodeBlock).at(1).find('.active'), "check if active lines size is correct for other componen post click - 1 click").toHaveLength(1);
            //Check if info column is correct
            expect(component.find("#strategy-message").at(0).text(), "correct strategy message 1").toBe("We've detected moved code between:Group1/coolio.ts @ 1 –\xa03Group2/sample.ts @ 3 –\xa03");

            //click on another red line - group1(3,5) & group2(1,2)
            component.find(OrginalCodeBlock).at(0).find('#code-line').at(3).simulate("click");
            //check if clicked component now has active lines
            expect(component.find(OrginalCodeBlock).at(0).find('.active'), "check if active lines size is correct for clicked component - 2 click").toHaveLength(3);
            //check if other block line is highlighted
            expect(component.find(OrginalCodeBlock).at(1).find('.active'), "check if active lines size is correct for other componen post click - 2 click").toHaveLength(2);
            //Check if info column is correct
            expect(component.find("#strategy-message").at(0).text(), "correct strategy message 2").toBe("We've detected moved code between:Group1/coolio.ts @ 3 –\xa05Group2/sample.ts @ 1 –\xa02");



            //click on another red line, this one overlaps between the two strategies
            component.find(OrginalCodeBlock).at(0).find('#code-line').at(2).simulate("click");
            //check if clicked component now has active lines
            expect(component.find(OrginalCodeBlock).at(0).find('.active'), "check if active lines size is correct for clicked component - overlap click").toHaveLength(5);
            //check if other block line is highlighted
            expect(component.find(OrginalCodeBlock).at(1).find('.active'), "check if active lines size is correct for other componen post click - overlap click").toHaveLength(3);
            //Check if info column is correct
            expect(component.find("#strategy-message").at(0).text(), "correct strategy message overlap 1").toBe("We've detected moved code between:Group1/coolio.ts @ 3 –\xa05Group2/sample.ts @ 1 –\xa02");
            expect(component.find("#strategy-message").at(1).text(), "correct strategy message overlap 2").toBe("We've detected moved code between:Group1/coolio.ts @ 1 –\xa03Group2/sample.ts @ 3 –\xa03");

            done();
        });
    });

    it('if you click on the back button it reroutes', async (done) => {
        const pushSpy = jest.spyOn(history, 'push');
        setImmediate(() => {
            const component = wrapper.find(OriginalComponent)
            component.find(Button).at(0).simulate('click', { button: 0 });
            expect(pushSpy, "if history has been called").toHaveBeenCalledTimes(1);
            expect(pushSpy, "if history has correct path call").toHaveBeenCalledWith({ "pathname": "/" });
            done();
        });
    });

    it('if you somehow get on this page without any data (reloading mainly)', async (done) => {
        //since this is a weird case of having literally no data, set up entire page
        mockedAxios.mockResolvedValueOnce({
            data: {
                overallPercentPlagarized: 0,
                plagarismInstances:
                    [{
                        avoidanceStrategy: undefined,
                        fileName1: "",
                        fileName2: "",
                        startLine1: 0,
                        startLine2: 0,
                        endLine1: 0,
                        endLine2: 0,
                        type1: "",
                        type2: ""
                    }]
            }
        });
        const noFileGroups = {
            fileGroups: [] as File[][],
            setFileGroups: ((files: File[][]) => undefined)
        }
        readAsTextSpy = jest.spyOn(FileReader.prototype, 'readAsText');
        wrapper = mount(<MainContext.Provider value={noFileGroups}>
            <Router history={history}>
                <ResultsComponent />
            </Router>
        </MainContext.Provider>);

        const pushSpy = jest.spyOn(history, 'push');
        setImmediate(() => {
            expect(pushSpy, "if history has been called").toHaveBeenCalledTimes(1);
            expect(pushSpy, "if history has correct path call").toHaveBeenCalledWith("/");
            done();
        });
    });


})
