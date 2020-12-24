import React from 'react';
import { render } from '@testing-library/react';
import FileUploadComponent, { FileUploadComponent as OriginalUploadComponent } from '../FileUploadComponent';
import { shallow } from 'enzyme';
import { Input } from '@material-ui/core';

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
  const updateFilesCallBack = jest.fn((files: File[]) => []);
  var props = {
    filesCallback: updateFilesCallBack
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('FileUploadComponent snapshot is rendered properly.', () => {
    const wrapper = render(<FileUploadComponent {...props} />)
    expect(wrapper).toMatchSnapshot();
  })

  it('make sure visual elements render, starting case', () => {
    const wrapper = shallow(<FileUploadComponent {...props} />);
    const component = wrapper.find(OriginalUploadComponent).dive();
    expect(component.find(Input), "sees if input exists").toHaveLength(1);
    expect(component.find(".file-name"), "there should be no file names when starting").toHaveLength(0);
  });

  it('accept one single file', () => {
    const wrapper = shallow(<FileUploadComponent {...props} />);
    const component = wrapper.find(OriginalUploadComponent).dive();
    //upload some files
    component.find(Input).simulate('change', {
      target: {
        files: [
          emptyFile
        ]
      }
    });
    expect(component.find(".file-name"), "sees if files exist").toHaveLength(1);
    expect(component.find(".file-name").text(), "sees if file name renders").toBe("empty.txt");
    expect(updateFilesCallBack, "see if function to pass call back is called").toHaveBeenCalledTimes(1);
    expect(updateFilesCallBack.mock.calls[0][0], "").toMatchObject([emptyFile]);
  });

  it('accept multiple files', () => {
    const wrapper = shallow(<FileUploadComponent {...props} />);
    const component = wrapper.find(OriginalUploadComponent).dive();
    //upload some files
    component.find(Input).simulate('change', {
      target: {
        files: [
          emptyFile,
          file,
          multifile
        ]
      }
    });
    expect(component.find(".file-name"), "sees if files exist").toHaveLength(3);
    expect(component.find(".file-name").at(0).text(), "sees if file name renders, with comma").toBe("empty.txt, ");
    expect(component.find(".file-name").at(1).text(), "sees if file name renders, with comma").toBe("sample.txt, ");
    expect(component.find(".file-name").at(2).text(), "sees if file name renders, no comma").toBe("sample.txt");

    expect(updateFilesCallBack, "see if function to pass call back is called").toHaveBeenCalledTimes(1);
    expect(updateFilesCallBack.mock.calls[0][0], "see if files are being passed back").toMatchObject([emptyFile, file, multifile]);
  });

  it('upload one, then upload another -> should overwrite', () => {
    const wrapper = shallow(<FileUploadComponent {...props} />);
    const component = wrapper.find(OriginalUploadComponent).dive();
    //upload some files
    component.find(Input).simulate('change', {
      target: {
        files: [
          emptyFile
        ]
      }
    });
    expect(component.find(".file-name"), "sees if files exist").toHaveLength(1);
    expect(component.find(".file-name").at(0).text(), "sees if file name renders").toBe("empty.txt");
    component.find(Input).simulate('change', {
      target: {
        files: [
          file, multifile
        ]
      }
    });
    expect(component.find(".file-name"), "sees if files exist").toHaveLength(2);
    expect(component.find(".file-name").at(0).text(), "sees if file name renders").toBe("sample.txt, ");
    expect(component.find(".file-name").at(1).text(), "sees if file name renders").toBe("sample.txt");
  });
});