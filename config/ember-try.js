'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = async function() {
  return {
    useYarn: true,
    scenarios: [
      {
        name: 'ember-lts-3.8',
        npm: {
          devDependencies: {
            'ember-source': '~3.8.0',
          },
          ember: {
            edition: 'classic',
          },
        },
      },
      {
        name: 'ember-lts-3.12',
        npm: {
          devDependencies: {
            'ember-source': '~3.12.0',
          },
          ember: {
            edition: 'classic',
          },
        },
      },
      {
        name: 'ember-lts-3.16',
        npm: {
          devDependencies: {
            'ember-source': '~3.16.0'
          }
        }
      },
      {
        name: 'ember-lts-3.20',
        npm: {
          devDependencies: {
            'ember-source': '~3.20.5'
          }
        }
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release')
          }
        }
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('beta')
          }
        }
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('canary')
          }
        }
      },
      {
        name: 'ember-classic',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'application-template-wrapper': true,
            'default-async-observers': false,
            'template-only-glimmer-components': false
          })
        },
        npm: {
          ember: {
            edition: 'classic'
          }
        }
      },
      {
        name: 'ember-lts-3.8-ec-1.0',
        npm: {
          devDependencies: {
            'ember-source': '~3.8.0',
          },
          ember: {
            edition: 'classic',
          },
        },
      },
      {
        name: 'ember-lts-3.12-ec-1.0',
        npm: {
          devDependencies: {
            'ember-source': '~3.12.0',
          },
          ember: {
            edition: 'classic',
          },
        },
      },
      {
        name: 'ember-lts-3.16-ec-1.0',
        npm: {
          devDependencies: {
            'ember-source': '~3.16.0',
            'ember-concurrency': '^1.0.0'
          }
        }
      },
      {
        name: 'ember-lts-3.20-ec-1.0',
        npm: {
          devDependencies: {
            'ember-source': '~3.20.5',
            'ember-concurrency': '^1.0.0'
          }
        }
      },
      {
        name: 'ember-release-ec-1.0',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
            'ember-concurrency': '^1.0.0'
          }
        }
      },
      {
        name: 'ember-beta-ec-1.0',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('beta'),
            'ember-concurrency': '^1.0.0'
          }
        }
      },
      {
        name: 'ember-canary-ec-1.0',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('canary'),
            'ember-concurrency': '^1.0.0'
          }
        }
      },
      {
        name: 'ember-classic-ec-1.0',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'application-template-wrapper': true,
            'default-async-observers': false,
            'template-only-glimmer-components': false
          })
        },
        npm: {
          ember: {
            edition: 'classic'
          },
          devDependencies: {
            'ember-concurrency': '^1.0.0'
          }
        }
      }
    ]
  };
};
