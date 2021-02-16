(function () {
    'use strict';

    const ds = require('data-service');

    const PollDataKeys = {
        Balance: 'balance',
        Description: 'description',
        Option: 'option',
        StartBlock: 'start',
        EndBlock: 'end',
        Title: 'title',
        VerifiedVoter: 'premium'
    };

    /**
     * @param {Waves} waves
     * @return {VotingService}
     */
    const factory = function (waves) {

        class VotingService {

            async fetchPolls() {
                // TODO: get the field address from elsewhere
                const pollData = await ds.api.data.getDataFields('3Xs2fU5anbFLY4KfPTWqa2AxkBkFJzdMw9c');
                return this._parsePollData(pollData);
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

                    const poll = parsedPolls[token.pollId] || { options: {} };

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

    factory.$inject = ['waves'];

    angular.module('app.voting').factory('votingService', factory);
})();
