import type { NextConfig } from 'next';

const config: NextConfig = {
  // The CV and search rules in profile/ are read at run time, so ship them with the server code.
  outputFileTracingIncludes: { '/**': ['./profile/**'] },
};
export default config;
