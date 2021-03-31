(function () {
    'use strict';

    const ds = require('data-service');
    const { SIGN_TYPE } = require('@turtlenetwork/signature-adapter');
    const { Money } = require('@waves/data-entities');

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

            async fetchPolls({ userAddress }) {
                const data = await ds.api.data.getDataFields(VotingDAppId);
                return this._parsePollData({ data, userAddress });
            }

            /**
             * Checks whether an user is eligible for a poll or not
             * @param {Money} balance The accounts balance
             * @param pollData The data obtained by fetchPolls
             * @return {boolean}
             */
            isEligibleForPoll({ balance, pollData }) {
                const pollBalance = new Money.fromCoins(pollData.balance, ds.api.assets.wavesAsset);
                return balance.gte(pollBalance) && (pollData.anonymous_vote || pollData.isPremiumUser);
            }

            /**
             * Gets voted option
             * @param userAddress
             * @param pollData
             * @return {object|null} voted option, or null, if has not voted
             */
            getVotedOptionForPoll({ userAddress, pollData }) {
                const filtered = Object.keys(pollData.options)
                    .filter(k => pollData.options[k].votes.includes(userAddress));
                return filtered.length > 0 ? filtered[0] : null;
            }

            async signVote({ pollId, voteId }) {
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
                                value: pollId
                            },
                            {
                                type: 'integer',
                                value: voteId
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

            _parsePollData({ data, userAddress }) {
                const parsedPolls = {};

                const tokenizeKey = str => {
                    const indexStart = str.indexOf('<');
                    const indexEnd = str.indexOf('>');
                    return {
                        key: str.substring(0, indexStart - 1),
                        ref: str.substring(indexStart + 1, indexEnd),
                        appendix: str.substr(indexEnd + 1)
                    };
                };

                // premium feature is globally, and not per poll
                let isPremiumUser = false;

                data.forEach(entry => {
                    const token = tokenizeKey(entry.key);

                    if (!token.key) {
                        return;
                    }

                    if (token.key === PollDataKeys.VerifiedVoter) {
                        isPremiumUser = isPremiumUser || token.ref === userAddress;
                        return;
                    }

                    const pollId = token.ref;
                    const poll = parsedPolls[pollId] || {
                        id: parseInt(pollId, 10),
                        options: {},
                        isPremiumUser
                    };

                    if (token.key === PollDataKeys.Option) {
                        const optionId = token.appendix.replace('_', '');
                        parsedPolls[pollId].options[optionId] = {
                            label: entry.value,
                            votes: []
                        };
                    } else {
                        parsedPolls[pollId] = {
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
                    const [accountId, pollId] = token.appendix.split('_');
                    parsedPolls[pollId].options[entry.value].votes.push(accountId);
                });

                return parsedPolls;
            }

        }

        return new VotingService();
    };

    factory.$inject = [];

    angular.module('app.voting').factory('votingService', factory);
})();
