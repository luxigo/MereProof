/*
import React, { useState, ChangeEvent, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import blake from 'blakejs'
import { HexString } from '@alephium/web3'
import { BsExclamationCircle, BsTrash } from "react-icons/bs";

declare module "react" {
    interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
        webkitdirectory?: string
        directory?: string
    }
}

interface MerkleProof {
    hashType: string
    root: string
    hash: string
    operations: Array<Operation>
    anchors: Array<Anchor>
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

interface FileItem {
    name: string
}

interface myFileItem extends FileItem {
    hashType?: string
    hash?: HexString
    proof?: MerkleProof
    pairedWith?: FileItem
    isSibling?: boolean
}

enum modes {
    Validate = "Validate",
    Anchor = "Anchor",
    Undefined = 0
}

const hashFunction = {
    blake2b_256: (buf: Uint8Array): string => { return blake.blake2sHex(buf, undefined, 32) }
}

export const DropZone = () => {

    const [files, setFiles] = useState<FileItem[]>([])

    const [mode, setMode] = useState<modes>(modes.Undefined)

    const [ready, setReady] = useState<boolean>(false)

    const updateAll = (): void => {

        updateMode();
        updateReady();
    }

    // auto-switch between validation and anchoring
    const updateMode = (): void => {
        var _mode: modes = modes.Anchor;
        // if there is one proof, assume we are validating
        (files as myFileItem[]).some((file) => {
            if (file.proof) {
                _mode = modes.Validate;
                return true;

            }
        })
        if (mode != _mode)
            setMode(_mode)
    }

    // check if we are ready to anchor or validate something
    const updateReady = (): void => {
        // if there is no proof we are ready to anchor
        var weAreReady: boolean = (files.length > 0);

        // if there is an orphan proof we are not ready to validate
        if (mode != modes.Anchor) {
            (files as myFileItem[]).some((file) => {
                if (!file.pairedWith) {
                    weAreReady = false
                    return true
                }
            })
        }
        if (ready != weAreReady)
            setReady(weAreReady)
    }

    const computeHash = (file: myFileItem, content: ArrayBuffer) => {
        file.hashType = 'blake2s'
        if (!file.hash)
            switch (file.hashType) {
                case 'blake2s': file.hash = blake.blake2sHex(new Uint8Array(content)); break
            }
        // new Uint8Array(content as ArrayBuffer)
    }

    const associateTextFileWithSibling = (textFile: myFileItem): void => {
        (files as myFileItem[]).some((file) => {
            var proof = file.proof;
            if (proof && proof.hashType == textFile.hashType && proof.operations && proof.operations[0].right && proof.operations[0].right == textFile.hash) {
                textFile.pairedWith = file
                textFile.isSibling = true
            }
        })
    }

    const associateFileWithProof = (lonelyFile: myFileItem): void => {
        (files as myFileItem[]).some((file) => {
            var proof = file.proof
            if (proof && proof.hashType && proof.hashType == lonelyFile.hashType && proof.hash && proof.hash == lonelyFile.hash) {
                lonelyFile.pairedWith = file
                file.pairedWith = lonelyFile
                return true
            }
        })
    }

    const associateProofWithFile = (orphanProof: myFileItem): void => {
        (files as myFileItem[]).some((file) => {
            if (!file.proof && orphanProof.proof && file.hashType == orphanProof.proof.hashType && file.hash == orphanProof.hash) {
                orphanProof.pairedWith = file
                file.pairedWith = orphanProof
                return true
            }
        })
    }

    const proofOrNothing = (proof: MerkleProof): MerkleProof | undefined => {
        if (proof.root && proof.hashType && proof.hash && proof.date && proof.operations && proof.operations.length && proof.anchors && proof.anchors.length) {
            return proof;
        }
    }

    const processFileListItem = (file: FileItem, content: string | ArrayBuffer | undefined): FileItem => {
        var fileItem = (file as myFileItem)
        if (fileItem.name.match(/.json$/i)) {
            // file is a json, try to parse it once
            // fileItem.proof = fileItem.proof || content && proofOrNothing(JSON.parse(String.fromCharCode.apply(null, new Uint8Array(content as ArrayBufferLike) as unknown as number[])) as MerkleProof) || undefined
            fileItem.proof = fileItem.proof || content && proofOrNothing(JSON.parse(content as string) as MerkleProof) || undefined
        }
        if (fileItem.proof) {
            // file is a proof
            // try to associate the proof with a file
            associateProofWithFile(fileItem)
            setMode(modes.Validate)

        } else {
            // file is not a proof
            computeHash(fileItem, content as ArrayBuffer)
            // try to associate the file with a proof
            associateFileWithProof(fileItem)

            if (fileItem.name.match(/(.*).txt$/i)) {
                // try to associate the text file with a sibling
                associateTextFileWithSibling(fileItem)
            }
        }
        return fileItem;
    }

    const onDrop = useCallback((acceptedFiles: File[]) => {
        var remaining: number = acceptedFiles.length;

        acceptedFiles.forEach((file: File) => {
            const reader = new FileReader()

            reader.onabort = () => {
                console.log('file reading was aborted')
            }
            reader.onerror = () => {
                console.log('file reading has failed')
            }
            reader.onload = (e: ProgressEvent<FileReader>) => {
                e.target && e.target.result &&
                    setFiles((files) => [...files, processFileListItem({
                        name: file.name
                    }, e.target && e.target.result || undefined)])
            }
            reader.onloadend = () => {
                --remaining
                if (!remaining) {
                    updateAll();
                    if (ready == true) {
                        if (mode == modes.Validate)
                            DoValidate()
                    }
                }
            }
            if (file.name.match(/\.json$/i))
                reader.readAsText(file)
            else
                reader.readAsArrayBuffer(file)
        })

    }, [])

    const { getRootProps, getInputProps } = useDropzone({ onDrop })
    const getClassName = (file: myFileItem): string => {
        updateMode();
        var classList: string[] = []
        if (mode == modes.Validate) {
            if (!file.pairedWith)
                classList.push("unpaired")
            if (file.proof)
                classList.push("proof")
            else
                classList.push("file")
            if (file.isSibling)
                classList.push("sibling")

        } else {

        }
        return classList.join(' ')
        console.log('here')
    }

    const clear = () => {
        setFiles([])
        setMode(modes.Undefined)
    }

    const abortClick = (e: React.MouseEvent<HTMLElement>): boolean => {
        e.stopPropagation()
        return false;
    }

    return (
        <div className="DropZone">
            <div {...getRootProps()}>
                <input {...getInputProps()} multiple />
                <p>Drag 'n' drop some files here, or click to select files</p>
            {files.length > 0 && (
                <div onClick={abortClick}>
                    <h3>Selected Files:</h3>
                    <ul className="dropzone">
                        {(files as myFileItem[]).map((file, index) => (
                            <li key={index} className={getClassName(file)}>
                                <BsExclamationCircle className="unpaired" title="Proof has matching file !"></BsExclamationCircle>
                                <BsExclamationCircle className="unpaired" title="File has no matching proof !"></BsExclamationCircle>
                                <BsTrash className="trash"></BsTrash>
                                <span>{file.name}</span>
                                <span>{file.hash}</span>
                           </li>
                        ))}
                    </ul>
                </div>
            )}
                        </div>

            <span><button disabled={!ready}>{mode == modes.Undefined ? "Anchor or Validate" : mode}</button>
                <button disabled={!files.length} onClick={clear}>Clear</button></span>
        </div>
    )
}


*/

export {}