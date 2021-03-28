(function () {
    'use strict';

    const ds = require('data-service');
    const { SIGN_TYPE } = require('@turtlenetwork/signature-adapter');

    const PollDataKeys = {
        Balance: 'balance',
        Description: 'description',
        Option: 'option',
        StartBlock: 'start',
        EndBlock: 'end',
        Title: 'title',
        VerifiedVoter: 'premium'
    };

    const VotingDAppId = WavesApp.oracles.voting;

    /**
     * @return {VotingService}
     */
    const factory = function () {

        class VotingService {

            async fetchPolls() {
                const pollData = await ds.api.data.getDataFields(VotingDAppId);
                return this._parsePollData(pollData);
            }

            /**
             * Checks whether an account is elegible or not
             * @param accountId an user account
             * @param balance The accounts balance
             * @param pollData The data obtained by fetchPolls
             * @return {boolean}
             */
            // eslint-disable-next-line no-unused-vars
            isEligible({ accountId, balance, pollData }) {
                // TODO: check eligibility
                return true;
            }

            async sendVote(pollData) {
                const txData = {
                    type: SIGN_TYPE.SCRIPT_INVOCATION,
                    version: 1,
                    dApp: VotingDAppId,
                    fee: 100000000,
                    feeAssetId: null,
                    payment: [],
                    call: {
                        function: 'vote',
                        args: [
                            {
                                type: 'integer',
                                value: pollData.id
                            },
                            {
                                type: 'integer',
                                value: this.vote
                            }
                        ]
                    }
                };

                const [tx] = await ds.api.transactions.parseTx([txData]);
                return ds.signature.getSignatureApi().makeSignable({
                    type: txData.type,
                    data: tx
                });
            }

            _parsePollData(data) {
                const parsedPolls = {};

                const tokenizeKey = str => {
                    const indexStart = str.indexOf('<');
                    const indexEnd = str.indexOf('>');
                    return {
                        key: str.substring(0, indexStart - 1),
                        pollId: str.substring(indexStart + 1, indexEnd),
                        appendix: str.substr(indexEnd + 1)
                    };
                };

                // get poll descriptor
                data.forEach(entry => {
                    const token = tokenizeKey(entry.key);

                    if (!token.key || token.key === PollDataKeys.VerifiedVoter) {
                        return;
                    }

                    const poll = parsedPolls[token.pollId] || {
                        id: parseInt(token.pollId, 10),
                        options: {}
                    };

                    if (token.key === PollDataKeys.Option) {
                        const optionId = token.appendix.replace('_', '');
                        parsedPolls[token.pollId].options[optionId] = {
                            label: entry.value,
                            votes: 0
                        };
                    } else {
                        parsedPolls[token.pollId] = {
                            ...poll,
                            [token.key]: entry.value
                        };
                    }
                });

                // count votes - must be done after poll object was mounted
                data.forEach(entry => {
                    const token = tokenizeKey(entry.key);
                    if (token.key) {
                        return;
                    }
                    const underscoreIndex = token.appendix.lastIndexOf('_');
                    const pollId = token.appendix.substring(underscoreIndex + 1);
                    parsedPolls[pollId].options[entry.value].votes++;
                });

                return parsedPolls;
            }

        }

        return new VotingService();
    };

    factory.$inject = [];

    angular.module('app.voting').factory('votingService', factory);
})();
