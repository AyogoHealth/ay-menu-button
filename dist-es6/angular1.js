/*! Copyright 2016 Ayogo Health Inc. */
import * as angular from 'angular';
import MenuButton from './index';
const modName = 'ayMenuButton';
angular.module(modName, [])
    .directive('button', function () {
    return {
        restrict: 'E',
        link: function (_$scope, $element) {
            let el = $element[0];
            if (el.getAttribute('type') === 'menu' || el.getAttribute('data-type') === 'menu') {
                let behaviour = MenuButton(el);
                $element.on('$destroy', () => {
                    behaviour.destroy();
                });
            }
        }
    };
});
export default modName;
//# sourceMappingURL=angular1.js.map