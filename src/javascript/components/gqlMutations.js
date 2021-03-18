import gql from 'graphql-tag';
import {DefaultVanityUrlFields, DefaultVanityUrls} from './gqlFragments';

const UpdateVanityMutation = gql`
    mutation updateVanity($ids: [String!]!, $defaultMapping: Boolean, $active: Boolean, $url: String, $language: String, $lang: String!) {
        jcr {
            mutateVanityUrls(pathsOrIds: $ids) {
              update(defaultMapping:$defaultMapping,active:$active,url:$url, language:$language)
            }
            modifiedNodes {
              ...DefaultVanityUrlFields
            }
        }
    }
    ${DefaultVanityUrlFields}
`;

const PublishMutation = gql`
    mutation mutateNodes($pathsOrIds: [String!]!, $publishSubNodes: Boolean) {
        jcr {
            mutateNodes(pathsOrIds: $pathsOrIds) {
                publish(publishSubNodes: $publishSubNodes)
            }
        }
    }
`;

const DeleteVanity = gql`
    mutation deleteVanityUrls($pathsOrIds: [String!]!, $lang: String!) {
        jcr {
            mutateVanityUrls(pathsOrIds: $pathsOrIds){
                delete
            }
            modifiedNodes {
              ...DefaultVanityUrlFields
            }
        }
    }    
    ${DefaultVanityUrlFields}
`;

const MoveMutation = gql`
    mutation mutateNodes($pathsOrIds: [String!]!, $target: String!) {
        jcr {
            mutateVanityUrls(pathsOrIds: $pathsOrIds) {
                move(target: $target)
            }
        }
    }
`;

const AddVanityMutation = gql`
    mutation addVanity($vanityUrls: [InputVanityUrl]!, $path: String!) {
        jcr {
            mutateNode(pathOrId: $path) {
                addVanityUrl(vanityUrlInputList: $vanityUrls) {
                    uuid
                }
            }
            modifiedNodes{
                uuid
            }
        }
    }
`;
export {MoveMutation, UpdateVanityMutation, PublishMutation, DeleteVanity, AddVanityMutation};
