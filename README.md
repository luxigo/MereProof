# MereProof
The initial goal of this hackathon project was to add Alephium support to the static webpage project https://github.com/luxigo/merklizer (which is used in https://merklizer.xyz)

Given the lack of a pure JS implementation or a pure JS interface to the Alephium libraries, it was needed (a priori) to deal with TypeScript, React and NextJS and refactor Merklizer into "MereProof" despite my zero-knowledge or TS/React/NextJS.

After a week of "deep learning", and among other things I had tweaked the TS/React/NextJS Alephium TokenFaucet template to anchor hashes instead (branch alephash), https://github.com/luxigo/MereProof/tree/alephash 

Also, seeing how to export the app as a static page with (“npm run export” and some “standalone” setting in the config), binding Merklizer with this project using some windowEvent glue handlers and UseEffect() appeared feasible.

This project ended as a PoC of "Using Alephium wallet (React/NextJS/TS) from AngularJS 1.8.2 in pure JS" meant to run in an iframe.

As part of the hackathon, the worfklow for anchoring hashes, building and verifying proofs anchored on Alephium (using this project from AngularJS 1.8.2) was implemented in project Merklizer (branch hackathon): https://github.com/luxigo/merklizer/tree/hackathon

You can see the diff here https://github.com/alsenet-labs/merklizer/compare/master...luxigo:merklizer:hackathon.patch

(or with colors and ignoring identation changes with eg: "git diff origin/hackathon -b")


## Build
For example:
```
npm run testnet:build && npm run export
```
Will generate a static NextJS webpage meant to be loaded in an iframe allowing the parent window to use Alephium testnet from a pure JS application using window events.

## Important
Header X-Frame-Options must be set to SAMEORIGIN on the server. 

## Static Page Live Demo (using testnet)
Note: No files are uploaded, they are processed in the browser.

The live demo is online here: https://miprosoft.com/hackathon

Test data for validation is available at https://miprosoft.com/elephant.zip (unpack the content and drop it in the validation panel).

The source code for the demo is here: https://github.com/luxigo/merklizer/tree/hackathon/webapp/client/app

## License
This project is licensed under AGPLv3.0 or later, see https://github.com/luxigo/MereProof/blob/main/LICENSE

## Contact
You can contact me on Discord or by mail at luc.deschenaux@freesuf.ch




