import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../bundleboard-api/src/main/resources/graphql/**/*.graphqls',
  documents: ['src/graphql/**/*.graphql'],
  generates: {
    'src/graphql/generated.ts': {
      plugins: [
        'typescript-operations',
        'typed-document-node',
      ],
      config: {
        enumsAsTypes: true, 
        scalars: {
          String: 'string',
          Int: 'number',
          Float: 'number',
          Boolean: 'boolean',
          ID: 'string',
        },
        declarationKind: {
          type: 'interface',
          input: 'interface'
        }
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;