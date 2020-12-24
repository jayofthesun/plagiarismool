import React from 'react';
/**
 * Creates a global context to pass uploaded files between the upload component and the result component
 */
const defaultVal = {
  fileGroups: [] as File[][]
}

export const MainContext = React.createContext(defaultVal);
