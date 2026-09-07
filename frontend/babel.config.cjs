// Jest roda em CommonJS, onde `import.meta` é erro de sintaxe. Como
// services/api.js usa `import.meta.env.VITE_API_URL`, qualquer teste que
// importe uma página transitivamente quebrava na carga — era por isso que
// as 5 suites do frontend falhavam sem executar um único teste.
//
// Plugin local em vez de dependência nova: as versões publicadas conflitam
// com os peers deste projeto, e a transformação necessária cabe em 12 linhas.
function transformarImportMeta({ types: t }) {
  return {
    name: 'transformar-import-meta',
    visitor: {
      MetaProperty(caminho) {
        // import.meta  ->  ({ env: process.env })
        caminho.replaceWith(
          t.objectExpression([
            t.objectProperty(
              t.identifier('env'),
              t.memberExpression(t.identifier('process'), t.identifier('env'))
            ),
          ])
        );
      },
    },
  };
}

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: [transformarImportMeta],
};
