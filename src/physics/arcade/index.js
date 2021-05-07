/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2020 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

var CONST = require('./const');
var Extend = require('../../utils/object/Extend');

/**
 * @namespace Phaser.Physics.Arcade
 */

var Axis = require('./Axis');

var GetOverlap = require('./GetOverlap');
var Separate = require('./Separate');

var Arcade = {
    ArcadePhysics: require('./ArcadePhysics'),
    Axis: Axis,
    Body: require('./Body'),
    Collider: require('./Collider'),
    Components: require('./components'),
    Events: require('./events'),
    Factory: require('./Factory'),
    GetOverlap: GetOverlap,
    GetOverlapX: GetOverlap.bind(undefined, Axis.X),
    GetOverlapY: GetOverlap.bind(undefined, Axis.Y),
    Group: require('./PhysicsGroup'),
    Image: require('./ArcadeImage'),
    Separate: Separate,
    SeparateX: Separate.bind(undefined, Axis.X),
    SeparateY: Separate.bind(undefined, Axis.Y),
    Sprite: require('./ArcadeSprite'),
    StaticBody: require('./StaticBody'),
    StaticGroup: require('./StaticPhysicsGroup'),
    Tilemap: require('./tilemap/'),
    World: require('./World')

};

//   Merge in the consts
Arcade = Extend(false, Arcade, CONST);

module.exports = Arcade;
