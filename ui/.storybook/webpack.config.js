const _ = require('lodash');

module.exports = ({config}) => {
  config.module.rules.push(
    {
      test: /\.(tsx?)$/,
      use: [
        {
          loader: require.resolve('ts-loader'),
          options: {
            transpileOnly: true,
          }
        }
      ],
      exclude: /node_modules/
    },
  );

  //exclude babel from default storybook webpack config
  config.module.rules = config.module.rules.filter((rule) => {
    const use = (rule.use || []);
    return !_.some(use, (it) => (it.loader || "") === 'babel-loader');
  });

  config.resolve.extensions.push('.ts', '.tsx', '.js');

  return config;
};