import {
  Case,
  StringNode as RawStringNode,
  Mod,
  NodeChildren,
  NumberNode,
  ObjectNode,
  Reference as RawReference,
  Switch,
  BooleanNode,
  ListNode,
  ChoiceNode,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
} from '@mcschema/core'
import { UniformInt } from '../Common'
import './Decorator'
import './ProcessorList'

export function initFeatureSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  const RandomPatchConfig: NodeChildren = {
    can_replace: BooleanNode(),
    project: BooleanNode(),
    need_water: BooleanNode(),
    xspread: NumberNode({ integer: true }),
    yspread: NumberNode({ integer: true }),
    zspread: NumberNode({ integer: true }),
    tries: NumberNode({ integer: true }),
    state_provider: Reference('block_state_provider'),
    block_placer: Reference('block_placer'),
    whitelist: ListNode(
      Reference('block_state')
    ),
    blacklist: ListNode(
      Reference('block_state')
    )
  }

  const DiskConfig: NodeChildren = {
    state: Reference('block_state'),
    radius: UniformInt({ min: 0, max: 4, maxSpread: 4 }),
    half_height: NumberNode({ integer: true, min: 0, max: 4 }),
    targets: ListNode(
      Reference('block_state')
    )
  }

  const HugeMushroomConfig: NodeChildren = {
    cap_provider: Reference('block_state_provider'),
    stem_provider: Reference('block_state_provider'),
    foliage_radius: Opt(NumberNode({ integer: true }))
  }

  const OreConfig: NodeChildren = {
    state: Reference('block_state'),
    size: NumberNode({ integer: true, min: 0, max: 64 }),
    target: Reference('rule_test')
  }

  const CountConfig: NodeChildren = {
    count: UniformInt({ min: -10, max: 128, maxSpread: 128 })
  }

  const Feature = ChoiceNode([
    {
      type: 'string',
      node: StringNode({ validator: 'resource', params: { pool: '$worldgen/configured_feature' } })
    },
    {
      type: 'object',
      node: Reference('configured_feature')
    }
  ], { choiceContext: 'feature' })

  schemas.register('configured_feature', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'worldgen/feature' } }),
    config: ObjectNode({
      [Switch]: ['pop', { push: 'type' }],
      [Case]: {
        'minecraft:bamboo': {
          probability: NumberNode({ min: 0, max: 1 })
        },
        'minecraft:basalt_columns': {
          reach: UniformInt({ min: 0, max: 2, maxSpread: 1 }),
          height: UniformInt({ min: 1, max: 5, maxSpread: 5 })
        },
        'minecraft:block_pile': {
          state_provider: Reference('block_state_provider')
        },
        'minecraft:decorated': {
          decorator: Reference('configured_decorator'),
          feature: Feature
        },
        'minecraft:delta_feature': {
          contents: Reference('block_state'),
          rim: Reference('block_state'),
          size: UniformInt({ min: 0, max: 8, maxSpread: 8 }),
          rim_size: UniformInt({ min: 0, max: 8, maxSpread: 8 })
        },
        'minecraft:disk': DiskConfig,
        'minecraft:emerald_ore': {
          state: Reference('block_state'),
          target: Reference('block_state')
        },
        'minecraft:end_gateway': {
          exact: BooleanNode(),
          exit: Opt(Reference('block_pos'))
        },
        'minecraft:end_spike': {
          crystal_invulnerable: Opt(BooleanNode()),
          crystal_beam_target: Opt(Reference('block_pos')),
          spikes: ListNode(
            ObjectNode({
              centerX: Opt(NumberNode({ integer: true })),
              centerZ: Opt(NumberNode({ integer: true })),
              radius: Opt(NumberNode({ integer: true })),
              height: Opt(NumberNode({ integer: true })),
              guarded: Opt(BooleanNode())
            })
          )
        },
        'minecraft:fill_layer': {
          state: Reference('block_state'),
          height: NumberNode({ integer: true, min: 0, max: 255 })
        },
        'minecraft:flower': RandomPatchConfig,
        'minecraft:forest_rock': {
          state: Reference('block_state')
        },
        'minecraft:huge_brown_mushroom': HugeMushroomConfig,
        'minecraft:huge_fungus': {
          hat_state: Reference('block_state'),
          decor_state: Reference('block_state'),
          stem_state: Reference('block_state'),
          valid_base_block: Reference('block_state'),
          planted: Opt(BooleanNode())
        },
        'minecraft:huge_red_mushroom': HugeMushroomConfig,
        'minecraft:ice_patch': DiskConfig,
        'minecraft:iceberg': {
          state: Reference('block_state')
        },
        'minecraft:lake': {
          state: Reference('block_state')
        },
        'minecraft:nether_forest_vegetation': {
          state_provider: Reference('block_state_provider')
        },
        'minecraft:netherrack_replace_blobs': {
          state: Reference('block_state'),
          target: Reference('block_state'),
          radius: UniformInt()
        },
        'minecraft:no_bonemeal_flower': RandomPatchConfig,
        'minecraft:no_surface_ore': OreConfig,
        'minecraft:ore': OreConfig,
        'minecraft:random_patch': RandomPatchConfig,
        'minecraft:random_boolean_selector': {
          feature_false: Feature,
          feature_true: Feature
        },
        'minecraft:random_selector': {
          features: ListNode(
            ObjectNode({
              chance: NumberNode({ min: 0, max: 1 }),
              feature: Feature
            })
          ),
          default: Feature
        },
        'minecraft:sea_pickle': CountConfig,
        'minecraft:seagrass': {
          probability: NumberNode({ min: 0, max: 1 })
        },
        'minecraft:simple_block': {
          to_place: Reference('block_state'),
          place_on: ListNode(Reference('block_state')),
          place_in: ListNode(Reference('block_state')),
          place_under: ListNode(Reference('block_state'))
        },
        'minecraft:simple_random_selector': {
          features: ListNode(
            Feature
          )
        },
        'minecraft:spring_feature': {
          state: Reference('fluid_state'),
          rock_count: NumberNode({ integer: true }),
          hole_count: NumberNode({ integer: true }),
          requires_block_below: BooleanNode(),
          valid_blocks: ListNode(
            StringNode({ validator: 'resource', params: { pool: 'block' } })
          )
        },
        'minecraft:tree': {
          max_water_depth: NumberNode({ integer: true }),
          ignore_vines: BooleanNode(),
          heightmap: StringNode({ enum: 'heightmap_type' }),
          minimum_size: Reference('feature_size'),
          trunk_provider: Reference('block_state_provider'),
          leaves_provider: Reference('block_state_provider'),
          trunk_placer: ObjectNode({
            type: StringNode({ validator: 'resource', params: { pool: 'worldgen/trunk_placer_type' } }),
            base_height: NumberNode({ integer: true, min: 0, max: 32 }),
            height_rand_a: NumberNode({ integer: true, min: 0, max: 24 }),
            height_rand_b: NumberNode({ integer: true, min: 0, max: 24 })
          }, { context: 'trunk_placer' }),
          foliage_placer: ObjectNode({
            type: StringNode({ validator: 'resource', params: { pool: 'worldgen/foliage_placer_type' } }),
            radius: UniformInt({ min: 0, max: 8, maxSpread: 8 }),
            offset: UniformInt({ min: 0, max: 8, maxSpread: 8 }),
            [Switch]: [{ push: 'type' }],
            [Case]: {
              'minecraft:blob_foliage_placer': {
                height: NumberNode({ integer: true, min: 0, max: 16 })
              },
              'minecraft:bush_foliage_placer': {
                height: NumberNode({ integer: true, min: 0, max: 16 })
              },
              'minecraft:fancy_foliage_placer': {
                height: NumberNode({ integer: true, min: 0, max: 16 })
              },
              'minecraft:jungle_foliage_placer': {
                height: NumberNode({ integer: true, min: 0, max: 16 })
              },
              'minecraft:mega_pine_foliage_placer': {
                crown_height: UniformInt({ min: 0, max: 16, maxSpread: 8 })
              },
              'minecraft:pine_foliage_placer': {
                height: UniformInt({ min: 0, max: 16, maxSpread: 8 })
              },
              'minecraft:spruce_foliage_placer': {
                trunk_height: UniformInt({ min: 0, max: 16, maxSpread: 8 })
              }
            }
          }, { context: 'foliage_placer', disableSwitchContext: true }),
          decorators: ListNode(
            ObjectNode({
              type: StringNode({ validator: 'resource', params: { pool: 'worldgen/tree_decorator_type' } }),
              [Switch]: [{ push: 'type' }],
              [Case]: {
                'minecraft:alter_ground': {
                  provider: Reference('block_state_provider')
                },
                'minecraft:beehive': {
                  probability: NumberNode({ min: 0, max: 1 })
                },
                'minecraft:cocoa': {
                  probability: NumberNode({ min: 0, max: 1 })
                }
              }
            }, { context: 'tree_decorator' })
          )
        }
      }
    }, { context: 'feature' })
  }, { context: 'feature' }), {
    default: () => ({
      type: 'minecraft:decorated',
      config: {
        decorator: {
          type: 'minecraft:count',
          config: {
            count: 4
          }
        },
        feature: {
          type: 'minecraft:tree',
          config: {
            max_water_depth: 0,
            ignore_vines: true,
            minimum_size: {},
            trunk_placer: {
              base_height: 5,
              height_rand_a: 2,
              height_rand_b: 0
            },
            foliage_placer: {
              radius: 2,
              offset: 0,
              height: 3
            }
          }
        }
      }
    })
  }))

  schemas.register('feature_size', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'worldgen/feature_size_type' } }),
    min_clipped_height: Opt(NumberNode({ min: 0, max: 80 })),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'minecraft:two_layers_feature_size': {
        limit: Opt(NumberNode({ integer: true, min: 0, max: 81 })),
        lower_size: Opt(NumberNode({ integer: true, min: 0, max: 16 })),
        upper_size: Opt(NumberNode({ integer: true, min: 0, max: 16 }))
      },
      'minecraft:three_layers_feature_size': {
        limit: Opt(NumberNode({ integer: true, min: 0, max: 80 })),
        upper_limit: Opt(NumberNode({ integer: true, min: 0, max: 80 })),
        lower_size: Opt(NumberNode({ integer: true, min: 0, max: 16 })),
        middle_size: Opt(NumberNode({ integer: true, min: 0, max: 16 })),
        upper_size: Opt(NumberNode({ integer: true, min: 0, max: 16 }))
      }
    }
  }, { disableSwitchContext: true }), {
    default: () => ({
      type: 'minecraft:two_layers_feature_size'
    })
  }))

  schemas.register('block_state_provider', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'worldgen/block_state_provider_type' } }),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'minecraft:rotated_block_provider': {
        state: Reference('block_state')
      },
      'minecraft:simple_state_provider': {
        state: Reference('block_state')
      },
      'minecraft:weighted_state_provider': {
        entries: ListNode(
          Mod(ObjectNode({
            weight: NumberNode({ integer: true, min: 1 }),
            data: Reference('block_state')
          }), {
            default: () => ({
              data: {}
            })
          })
        )
      }
    }
  }, { context: 'block_state_provider' }), {
    default: () => ({
      type: 'minecraft:simple_state_provider'
    })
  }))

  schemas.register('block_placer', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'worldgen/block_placer_type' } }),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'minecraft:column_placer': {
        min_size: NumberNode({ integer: true }),
        extra_size: NumberNode({ integer: true })
      }
    }
  }, { context: 'block_placer' }), {
    default: () => ({
      type: 'minecraft:simple_block_placer'
    })
  }))
}
