const DEFAULT_BASE_URL = 'https://ide.csound.com';
const DEFAULT_PROJECT_URL =
  'https://ide.csound.com/editor/jQiIAlDXxe4KEPDTllii';
const BASE_URL = process.env.IDE_BASE_URL || DEFAULT_BASE_URL;
const PROJECT_URL = process.env.IDE_PROJECT_URL || DEFAULT_PROJECT_URL;

export { BASE_URL, PROJECT_URL };
