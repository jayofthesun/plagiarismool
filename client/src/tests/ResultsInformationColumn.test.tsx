import React from 'react';
import ResultsInformationColumn from '../ResultsInformationColumn';
import { shallow } from 'enzyme';
import { StrategyInstance } from '../enums/StrategyInstance';
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

describe('tests for the result information column component', () => {
    const strategyChangedCodeOrder = {
        avoidanceStrategy: StrategyInstance.changedCodeOrder,
        fileName1: 'test1.js',
        fileName2: 'test2.js',
        startLine1: 10,
        endLine1: 11,
        startLine2: 12,
        endLine2: 13
    }
    const strategyMovedCode = {
        avoidanceStrategy: StrategyInstance.movedCode,
        fileName1: 'test3.js',
        fileName2: 'test4.js',
        startLine1: 15,
        endLine1: 18,
        startLine2: 21,
        endLine2: 33
    }
    const strategyRenamedVariable = {
        avoidanceStrategy: StrategyInstance.renamedVariable,
        fileName1: 'test1.js',
        fileName2: 'test4.js',
        startLine1: 0,
        endLine1: 7,
        startLine2: 2,
        endLine2: 8
    }

    it('ResultsInformationColumn snapshot is rendered properly.', () => {
        const wrapper = render(<ResultsInformationColumn currentStrategies={[]} />)
        expect(wrapper).toMatchSnapshot();
    })

    it('should have a prompt message if there is no given strategies', () => {
        const wrapper = shallow(<ResultsInformationColumn currentStrategies={[]} />).dive();
        expect(wrapper.find('#results-info-message').text()).toBe('Please select a portion of highlighted code to view more details!');
    });

    it('should render correct file names and line numbers', () => {
        const wrapper = shallow(<ResultsInformationColumn currentStrategies={[strategyMovedCode]} />).dive();
        expect(wrapper.find('#group1-location').text(), "if first file message is rendered correctly").toBe('test3.js @ 15 – 18');
        expect(wrapper.find('#group2-location').text(), "if second file message is rendered correctly").toBe('test4.js @ 21 – 33');
    });

    it('should render correct message if given a "changedCodeOrder" instance', () => {
        const wrapper = shallow(<ResultsInformationColumn currentStrategies={[strategyChangedCodeOrder]} />).dive();
        expect(wrapper.find('#plagiarism-type').text()).toBe('changed code order');
    });

    it('should render correct message if given a "movedCode" instance', () => {
        const wrapper = shallow(<ResultsInformationColumn currentStrategies={[strategyMovedCode]} />).dive();
        expect(wrapper.find('#plagiarism-type').text()).toBe('moved code');
    });

    it('should render correct message if given a "renamedVariable" instance', () => {
        const wrapper = shallow(<ResultsInformationColumn currentStrategies={[strategyRenamedVariable]} />).dive();
        expect(wrapper.find('#plagiarism-type').text()).toBe('renamed variables');
    });

    it('should render correct number of instances of message if given multiple instances', () => {
        const wrapper = shallow(<ResultsInformationColumn currentStrategies={[strategyRenamedVariable, strategyMovedCode, strategyChangedCodeOrder]} />).dive();
        expect(wrapper.find('#strategy-message')).toHaveLength(3);
    });
});