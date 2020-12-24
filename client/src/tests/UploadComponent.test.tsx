import React from 'react';
import UploadComponent, { UploadComponent as OriginalComponent } from '../UploadComponent';
import { Button, Input } from '@material-ui/core';
import { ReactWrapper, shallow } from 'enzyme';
import { FileUploadComponent as OriginalUploadComponent } from '../FileUploadComponent';
import { Router } from 'react-router';
import { MainContext } from '../MainContext';
import { createMemoryHistory } from 'history'
import { createMount } from '@material-ui/core/test-utils';
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

describe('tests for the main upload component', () => {
    //Dummy files
    const file = new File(["hello", "oh boy"], "cool.ts");
    const file2 = new File(["coolio"], "coolio.ts");
    const file3 = new File(["sample"], 'sample.ts', {});
    const file4 = new File(["hello", "oh boy"], 'sample2.ts', {});
    const fileList = [[file, file2], [file3, file4]];

    //main context mock filegroups
    const contextFileGroups = {
        fileGroups: fileList,
        setFileGroups: ((files: File[][]) => undefined)
    }

    //routing mock history
    const history = createMemoryHistory({
        initialEntries: ['/'],
    });
    let mount;

    let wrapper: ReactWrapper<any, Readonly<{}>, React.Component<{}, {}, any>>;
    beforeEach(() => {

        mount = createMount();
        wrapper = mount(<MainContext.Provider value={contextFileGroups}>
            <Router history={history}>
                <UploadComponent />
            </Router>
        </MainContext.Provider>);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('UploadComponent snapshot is properly rendered.', () => {
        const component = render(<Router history={history}>
            <UploadComponent />
        </Router>)
        expect(component).toMatchSnapshot();
    })

    it('make sure visual elements render, starting case', () => {
        const component = wrapper.find(OriginalComponent)
        expect(component.find(OriginalUploadComponent), "sees if inputs component exists").toHaveLength(2);
        expect(component.find(Input), "sees if inputs exists").toHaveLength(2);
        expect(component.find(Button).props().disabled, "sees if button is disabled").toBe(true);
    });

    it('uploading one file to the left side', () => {
        let component = wrapper.find(OriginalComponent)
        expect(component.find(Button).props().disabled, "sees if button is disabled").toBe(true);
        component.find('input').at(0).simulate('change', {
            target: {
                files: [
                    file
                ]
            }
        });
        expect(component.find(Button).props().disabled, "sees if button is still disabled").toBe(true);
    });

    it('uploading one file to the right side', () => {
        let component = wrapper.find(OriginalComponent)
        expect(component.find(Button).props().disabled, "sees if button is disabled").toBe(true);
        component.find('input').at(1).simulate('change', {
            target: {
                files: [
                    file
                ]
            }
        });
        expect(component.find(Button).props().disabled, "sees if button is still disabled").toBe(true);
    });

    it('uploading one file to the both sides', () => {
        let component = wrapper.find(OriginalComponent)
        expect(component.find(Button).props().disabled, "sees if button is disabled").toBe(true);
        component.find('input').at(0).simulate('change', {
            target: {
                files: [
                    file
                ]
            }
        });

        component = wrapper.find(OriginalComponent)
        expect(component.find(Button).props().disabled, "sees if button is still disabled").toBe(true);
        component.find('input').at(1).simulate('change', {
            target: {
                files: [
                    file
                ]
            }
        });

        component = wrapper.find(OriginalComponent)
        expect(component.find(Button).props().disabled, "sees if button is not disabled").toBe(false);
    });

    it('click on uploaded button to get to result page', () => {
        const component = wrapper.find(OriginalComponent)
        expect(component.find(Input), "sees if input exists").toHaveLength(2);
        expect(component.find(Button).prop('disabled'), "sees if button is disabled").toBe(true);
        expect(component.find(".file-name"), "there should be no file names when starting").toHaveLength(0);
    });

    it('if you click on upload button loading screen works', () => {
        let component = wrapper.find(OriginalComponent)
        expect(component.state().isLoading, "see if screen is not loading - disabled button").toBe(false);
        expect(component.find('LoadingOverlayWrapper').prop('active'), "see if screen is not loading default - disabled button").toBe(false);
        component.find(Button).simulate('click', { button: 0 }); // try to click on disabled button

        component = wrapper.find(OriginalComponent)
        expect(component.find('LoadingOverlayWrapper').prop('active'), "see if screen is still loading - clicking disabled button works").toBe(false);

        //enable button clicking
        component.setState({ disabledButton: false })
        component = wrapper.find(OriginalComponent)
        expect(component.find('LoadingOverlayWrapper').prop('active'), "see if screen is not loading still").toBe(false);
        component.find(Button).simulate('click', { button: 0 });
        component = wrapper.find(OriginalComponent)
        expect(component.find('LoadingOverlayWrapper').prop('active'), "see if screen is loading when clicked").toBe(true);
    });
});