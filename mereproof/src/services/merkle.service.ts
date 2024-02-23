/*
* Copyright (c) 2018-2024 ALSENET SA
*
* Author(s):
*
*      Luc Deschenaux <luc.deschenaux@freesurf.ch>
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
*/

/*
import { assert } from 'console';
import { sha512, sha384, sha512_256, sha512_224, Hash, Message, Hasher } from 'js-sha512';

export const mask: number = 0xfffe
export var debug: boolean = false
export const version: string = 'mereproof-0.0.1'
export var defaultHashType: string = 'SHA512_256'

export interface MerkleProof {
  version?: string
  hashType: string
  root: string
  hash: string
  operations: Array<Operation>
  anchors?: Array<Anchor>
  date: string
}

interface Operation {
  left?: string
  right?: string
}

interface Anchor {
  type: string
  networkId: number
  transactionId: string
  blockId: string
  blockDate: string
}

export interface TreeNode {
  hash: number[]
  proof?: MerkleProof
}

export type Tree = Array<Array<TreeNode>>

export interface HashFunc<TValue> {
  [id: string]: TValue
}

export var _digest: HashFunc<(message: Message) => number[]> = {
  SHA512_256: sha512_256.digest,
  SHA512_224: sha512_224.digest,
  SHA512: sha512.digest,
  SHA384: sha384.digest
}

export const digest = (data: Message, hashType?: string): Promise<number[]> => {
  return new Promise((resolve, reject) => {
    resolve(_digest[hashType || defaultHashType](data))
  })
}

const hashToString = (hash: number[] | Uint8Array): string => {
  return Array.prototype.slice.call(hash).map(value => ((value & 0xf0 ? '' : '0') + (value.toString(16)))).join('')
}

const stringToHash = (hash_str: string): Uint8Array => {
  const a = hash_str.match(/.{2}/g) || [];
  return new Uint8Array(a.map(byte => parseInt(byte, 16)))
}

const hashMerge = (hashLeft: Uint8Array | number[] | string, hashRight: Uint8Array | number[] | string, hashType: string): Promise<number[]> => {
  if (typeof hashLeft == "string") {
    hashLeft = stringToHash(hashLeft)
  }
  if (typeof hashRight == "string") {
    hashRight = stringToHash(hashRight)
  }
  var result = new Uint8Array(hashLeft.length + hashRight.length)
  result.set(hashLeft, 0)
  result.set(hashRight, hashLeft.length)
  return digest(result, hashType)
}

const compute = (objectList: Array<TreeNode>, hashType: string): Promise<Tree> => {
  return computeTree(objectList, hashType)
    .then((tree: Tree): Tree => {
      computeProofs(tree, hashType)
      return tree
    })
}

const computeTree = (objectList: Array<TreeNode>, hashType: string): Promise<Tree> => {
  return new Promise<Tree>((resolve, reject) => {
    var leaves: TreeNode[] = [];
    var tree: Tree = [leaves];

    objectList.forEach(function (obj) {
      leaves.push(obj);
    });

    if (leaves.length > (mask | 1)) {
      reject(new Error('too much leaves'));
      return;
    }

    (function outerLoop(tree) {
      if (tree[0].length <= 1) {
        resolve(tree);
        return;
      }
      tree.unshift([]);

      return new Promise<Tree>((resolve, reject) => {
        (function loop(index) {
          if (index >= tree[1].length) {
            resolve(tree);
            return;
          }
          var node = tree[1][index];
          // not the last node ?
          if ((index | 1) < tree[1].length) {
            // merge hash with the next node hash
            return hashMerge(node.hash, tree[1][index | 1].hash, hashType)
              .then((hash) => {
                tree[0].push({
                  hash: hash
                });
                loop(index + 2);
              })
          } else {
            // last node without sibling
            if (index>0) {
              // merge with the first node hash instead
              return hashMerge(node.hash, tree[1][0].hash, hashType)
              .then((hash) => {
                tree[0].push({
                  hash: hash
                });
                loop(index + 2);
              })
            } else {
              // nothing to merge, store vanilla hash
              tree[0].push({
                hash: node.hash
              });
              loop(index + 2);
            }
          }
        })(0);
      })
    })(tree);
  })
} // computeTree

const computeProofs = (tree: Tree, hashType: string): void => {
  var leaves = tree[tree.length - 1];
  var date = (new Date()).toISOString();

  // for each leaf of the merkle tree
  leaves.some((leaf: TreeNode, leafIndex) => {

    leaf.proof = {
      version: version,
      hashType: hashType,
      hash: hashToString(leaf.hash),
      root: hashToString(tree[0][0].hash),
      date: date,
      operations: []
    }

    // at the top level, the node index matches the leaf index 
    var nodeIndex = leafIndex;

    // loop from leaf to root+1 level of the merkle tree
    for (var level = tree.length - 1; level >= 1; --level) {

      // get the nodes at the current level
      var here = tree[level];

      if (nodeIndex & 1) {
        // current node index is odd (last bit is 1)
        // so it is the "right" part of the pair
        // and we add the "left" part in the proof
        leaf.proof.operations.push({
          left: hashToString(here[nodeIndex & mask].hash)
        });

      } else {
        // current node index is even (last bit is 0)
        // so it is the "left" part of the pair
        // and we add the "right" part in the proof if any
        if ((nodeIndex | 1) < here.length) {
          // not the last node, there is a "right one"
          leaf.proof.operations.push({
            right: hashToString(here[nodeIndex | 1].hash)
          });
        }
      }
      // down a level the node index has to be halved
      nodeIndex = nodeIndex >> 1;
    }
  })

  if (debug) {
    leaves.some((leaf) => {
      if (!leaf.proof)
        console.log(leaf, 'missing proof !');
      else
        checkProof(leaf.proof)
          .then(validated => console.log(leaf.proof, validated.toString()));
    });
  }
} // computeProofs

const checkProof = (proof: MerkleProof): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    if (
      !proof
      || !proof.operations
      || !Array.isArray(proof.operations)
      || !proof.root
      || !proof.hash
    ) return resolve(false);

    debug && console.log(proof)

    new Promise<number[]>((resolve, reject) => {
      (function loop(hash: number[], i) {
        if (debug)
          console.log(hash)
        if (i >= proof.operations.length)
          return resolve(hash);

        var step = proof.operations[i];
        if (step.left)
          hashMerge(step.left, hash, proof.hashType)
            .then(hash => loop(hash, i + 1))
            .catch(reject);

        else
          if (step.right)
            hashMerge(hash, step.right, proof.hashType)
            .then(hash => loop(hash, i + 1))
            .catch(reject)

          else
            reject(new Error('invalid proof'));

      })(stringToHash(proof.hash) as unknown as number[], 0);
    })
      .then(hash => resolve(hashToString(hash) == proof.root))
      .catch(reject)
  })

} // checkProof

const getRoot = (tree: Tree): string => {
  return hashToString(tree[0][0].hash);
}
*/

export {}