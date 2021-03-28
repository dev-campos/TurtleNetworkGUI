(function () {
    'use strict';

    /**
     * @param Base
     * @param {$rootScope.Scope} $scope
     * @param createPoll
     * @param {app.utils} utils
     * @param {Waves} waves
     * @param {User} user
     * @param {BalanceWatcher} balanceWatcher
     * @return {VoteModalCtrl}
     */
    const controller = function (Base, $scope, createPoll, utils, waves, user, balanceWatcher) {

        // const entities = require('@waves/data-entities');
        const { SIGN_TYPE } = require('@turtlenetwork/signature-adapter');

        const ds = require('data-service');

        class VoteModalCtrl extends Base {

            /**
             * @type {args}
             */
            signPending = false;
            /**
             * @type {Array}
             * @private
             */
            _listeners = [];

            constructor({pollData}) {
                super($scope);
                /**
                 * @type {number}
                 */
                this.step = 0;
                this.pollData = pollData;

                console.log('pollData', pollData)

                /**
                 * @type {'burn'|'reissue'}
                 */
                // this.txType = txType;
                /**
                 * @type {ExtendedAsset}
                 */
                // this.asset = money.asset;
                /**
                 * @type {boolean}
                 */
                // this.issue = money.asset.reissuable;
                /**
                 * @type {BigNumber}
                 */
                // this.maxCoinsCount = WavesApp.maxCoinsCount.sub(money.asset.quantity);
                /**
                 * @type {Money}
                 */
                // this.balance = money;
                /**
                 * @type {Money}
                 */
                // this.precision = money.asset.precision;
                /**
                 * @type {Precision}
                 */
                this.input = null;
                /**
                 * @type {Money}
                 */
                //this.quantity = new entities.Money(this.asset.quantity, this.asset);
                /**
                 * @type {Money}
                 * @private
                 */
                this._waves = null;


                this.description = '' //description || money.asset.description;


                const type = SIGN_TYPE.SCRIPT_INVOCATION;
                // waves.node.getFee({ type, assetId: money.asset.id }).then((fee) => {
                //     this.fee = fee;
                //     $scope.$digest();
                // });

                // createPoll(this, this._getGraphData, 'chartData', 15000);
                // ds.api.assets.get(WavesApp.defaultAssets.TN).then(asset => {
                //     this.receive(balanceWatcher.change, () => this._updateWavesBalance(asset));
                //     this._updateWavesBalance(asset);
                // });

                // this.observe(['input', 'issue'], this._createTx);
                // this.observe(['_waves', 'fee'], this._changeHasFee);

                const signPendingListener = $scope.$on('signPendingChange', (event, data) => {
                    this.signPending = data;
                });

                this._listeners.push(signPendingListener);
            }

            $onDestroy() {
                super.$onDestroy();
                this._listeners.forEach(listener => listener());
            }

            getSignable() {
                return this.signable;
            }

            next() {
                this.step++;
            }

            /**
             * @param {Asset} asset
             * @private
             */
            _updateWavesBalance(asset) {
                this._waves = balanceWatcher.getBalanceByAsset(asset);
                utils.safeApply($scope);
            }

            /**
             * @private
             */
            _changeHasFee() {
                if (!this._waves || !this.fee) {
                    return null;
                }

                this.noFee = this._waves.lt(this.fee);
            }

            /**
             * @private
             */
            _createTx() {
                const input = this.input;
                const type = this.txType === 'burn' ? SIGN_TYPE.BURN : SIGN_TYPE.REISSUE;
                const quantityField = this.txType === 'burn' ? 'amount' : 'quantity';


                if (input) {
                    const tx = waves.node.transactions.createTransaction({
                        type,
                        assetId: input.asset.id,
                        description: input.asset.description,
                        fee: this.fee,
                        [quantityField]: input,
                        precision: input.asset.precision,
                        reissuable: this.issue
                    });
                    this.signable = ds.signature.getSignatureApi().makeSignable({
                        type,
                        data: tx
                    });
                } else {
                    this.tx = null;
                    this.signable = null;
                }
            }

            /**
             * @return {Promise<{values: {rate: number, timestamp: Date}[]}>}
             * @private
             */
            // _getGraphData() {
            //     const startDate = utils.moment().add().day(-100);
            //     return waves.utils.getRateHistory(this.asset.id, user.getSetting('baseAssetId'), startDate)
            //         .then((values) => ({ values }));
            // }

        }

        return new VoteModalCtrl(this);
    };

    controller.$inject = ['Base', '$scope', 'createPoll', 'utils', 'waves', 'user', 'balanceWatcher'];

    angular.module('app.utils').controller('VoteModalCtrl', controller);
})();
