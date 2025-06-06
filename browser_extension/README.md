This is a [Plasmo extension](https://docs.plasmo.com/) project.

I'm using yarn because of some [dependency issues](https://github.com/PlasmoHQ/plasmo/issues/973) with Plasmo. Plasmo might not be the right thing to use long term but I can't be bothered at the moment. 

To setup:

`yarn install`

To run locally:

`yarn run start_chrome` or `yarn run start_firefox`

To make a production build (unpackaged):

`yarn run build_chrome` or `yarn run build_firefox`

To make a production build (packaged):

`yarn run deploy_chrome` or `yarn run deploy_firefox`