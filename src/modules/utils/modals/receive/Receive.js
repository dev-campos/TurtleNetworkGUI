(function () {
    'use strict';

    /**
     * @param {typeof Base} Base
     * @param {ng.IScope} $scope
     * @param {GatewayService} gatewayService
     * @param {User} user
     * @param {Waves} waves
     * @return {ReceiveCtrl}
     */
    const controller = function (Base, $scope, gatewayService, user, waves) {

        class ReceiveCtrl extends Base {

            /**
             * @type {string}
             */
            activeTab = '';

            /**
             * @type { {[k: string]: boolean} }
             */
            tabs = {
                cryptocurrency: false,
                invoice: false
            };

            /**
             * @type {boolean}
             */
            isSingleAsset;

            /**
             * @type {Array}
             */
            cryptocurrencies;

            /**
             * @type {Array}
             */
            gatewayCryptocurrencies;

            /**
             * @type {Array}
             */
            invoicables;

            constructor({ asset, haveTabs }) {
                super($scope);

                /**
                 * @type {Asset}
                 */
                this.asset = asset;

                this.haveTabs = haveTabs;

                if (this.asset) {
                    this.isSingleAsset = true;
                    this.initForSingleAsset();
                } else {
                    this.isSingleAsset = false;
                    this.initForAllAssets();
                }
            }

            initForSingleAsset() {
                if (gatewayService.hasSupportOf(this.asset, 'deposit')) {
                    this.enableTab('cryptocurrency');
                }

                this.enableTab('invoice');
            }

            initForAllAssets() {
                const cryptocurrenciesRequests = this.getExtendedAssets(gatewayService.getCryptocurrencies());
                const cryptocurrenciesRequest = Promise.all(cryptocurrenciesRequests).then((results) => {
                    this.cryptocurrencies = results;
                });

                const invoicesRequest = waves.node.assets.userBalances().then((results) => {
                    this.invoicables = results
                        .filter((balance) => !user.scam[balance.asset.id])
                        .map((balance) => balance.asset);
                });

                Promise.all([
                    cryptocurrenciesRequest,
                    invoicesRequest
                ]).then(() => {
                    this.gatewayCryptocurrencies = this.cryptocurrencies
                        .filter(c => WavesApp.network.wavesGateway[c.id] !== undefined);
                    this.updateAssetBy(this.gatewayCryptocurrencies[0].id);

                    this.enableTab('cryptocurrency');
                    this.enableTab('invoice');

                    this.initForSingleAsset();
                });
            }

            /**
             * @param {Object} assetsIds
             */
            getExtendedAssets(assetsIds) {
                return (
                    Object
                        .keys(assetsIds)
                        .map(waves.node.assets.getAsset)
                );
            }

            /**
             * @param {string} id
             */
            updateAssetBy(id) {
                this.asset = (
                    this.cryptocurrencies.find((cryptocurrency) => cryptocurrency.id === id) ||
                    this.invoicables.find((invoicable) => invoicable.id === id)
                );
            }

            /**
             * @param {'cryptocurrency' | 'invoice'} name
             */
            enableTab(name) {
                this.tabs[name] = true;
            }

        }

        return new ReceiveCtrl(this.locals);
    };

    controller.$inject = ['Base', '$scope', 'gatewayService', 'user', 'waves'];

    angular.module('app.utils').controller('ReceiveCtrl', controller);
})();
