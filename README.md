# MereProof
Mer(kl)e proof (of existence) - compute the merkle root for a set of files and store its value on the Alephium blockchain, so that it can be proven all those documents were existing at the time the transaction was done while minimizing the blockchain space needed

## Description
For each file in the merkle tree  a "proof file" has to be generated, to associate its hash with the metadata needed to verify the file is belonging to the tree. 

Then the existence of each individual file at the time of the blockchain transaction can be validated using its associated proof.

I've been working previously on https://merklizer.xyz/ (6 years ago), a similar static plain JS dApp project aiming ETH and BTC blockchains.

I intend to start from scratch with Alephium/NextJS

However I could refactor some of merklizer, eg. the merkle tree computation/verification plain JS code (that was implemented primarly as an AngularJS service).

Contributors welcome !

## License
This project is licensed under AGPLv3.0 or later, see https://github.com/luxigo/MereProof/blob/main/LICENSE

## Contact
You can contact me on Discord or by mail at luc.deschenaux@freesuf.ch
