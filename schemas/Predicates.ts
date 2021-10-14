import {
  BooleanNode,
  StringNode as RawStringNode,
  ListNode,
  MapNode,
  ObjectNode,
  Opt,
  Reference as RawReference,
  Switch,
  Case,
  SchemaRegistry,
  ChoiceNode,
  CollectionRegistry,
  NumberNode,
  NodeChildren,
} from '@mcschema/core'
import { Range } from './Common'

export let LocationFields: NodeChildren

export function initPredicatesSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  const StateChoice = ChoiceNode([
    {
      type: 'string',
      node: StringNode(),
      change: v => (typeof v === 'boolean' || typeof v === 'number') ? v.toString() : ''
    },
    {
      type: 'number',
      node: NumberNode(),
      change: v => (typeof v === 'string') ? parseInt(v) : 0
    },
    {
      type: 'object',
      node: ObjectNode({
        min: Opt(NumberNode({ integer: true })),
        max: Opt(NumberNode({ integer: true }))
      }),
      change: v => (typeof v === 'number') ? ({ min: v, max: v }) : ({})
    },
    {
      type: 'boolean',
      node: BooleanNode(),
      change: v => v === 'true' || v === 1
    }
  ])

  schemas.register('item_predicate', ObjectNode({
    item: Opt(StringNode({ validator: 'resource', params: { pool: 'item' } })),
    tag: Opt(StringNode({ validator: 'resource', params: { pool: '$tag/item' } })),
    count: Opt(Range()),
    durability: Opt(Range()),
    potion: Opt(StringNode({ validator: 'resource', params: { pool: 'potion' } })),
    nbt: Opt(StringNode({ validator: 'nbt', params: { registry: { category: 'minecraft:item', id: ['pop', { push: 'item' }] } } })),
    enchantments: Opt(ListNode(
      Reference('enchantment_predicate')
    ))
  }, { context: 'item' }))

  schemas.register('enchantment_predicate', ObjectNode({
    enchantment: Opt(StringNode({ validator: 'resource', params: { pool: 'enchantment' } })),
    levels: Opt(Range())
  }, { context: 'enchantment' }))

  schemas.register('block_predicate', ObjectNode({
    block: Opt(StringNode({ validator: 'resource', params: { pool: 'block' } })),
    tag: Opt(StringNode({ validator: 'resource', params: { pool: '$tag/block' } })),
    nbt: Opt(StringNode({ validator: 'nbt', params: { registry: { category: 'minecraft:block', id: ['pop', { push: 'block' }] } } })),
    state: Opt(MapNode(
      StringNode(),
      StateChoice,
      { validation: { validator: 'block_state_map', params: { id: ['pop', { push: 'block' }] } } }
    ))
  }, { context: 'block' }))

  schemas.register('fluid_predicate', ObjectNode({
    fluid: Opt(StringNode({ validator: 'resource', params: { pool: 'fluid' } })),
    tag: Opt(StringNode({ validator: 'resource', params: { pool: '$tag/fluid' } })),
    state: Opt(MapNode(
      StringNode(),
      StateChoice
    ))
  }, { context: 'fluid' }))

  LocationFields = {
    position: Opt(ObjectNode({
      x: Opt(Range()),
      y: Opt(Range()),
      z: Opt(Range())
    })),
    biome: Opt(StringNode({ enum: 'biome' })),
    feature: Opt(StringNode({ enum: 'structure_feature' })),
    dimension: Opt(StringNode({ enum: 'dimension' })),
    light: Opt(ObjectNode({
      light: Opt(Range({ integer: true, min: 0, max: 15 }))
    })),
    block: Opt(Reference('block_predicate')),
    fluid: Opt(Reference('fluid_predicate'))
  }

  schemas.register('location_predicate', ObjectNode(LocationFields, { context: 'location' }))

  schemas.register('statistic_predicate', ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'stat_type' } }),
    stat: StringNode(),
    value: Range(),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'minecraft:mined': {
        stat: StringNode({ validator: 'resource', params: { pool: 'block' } })
      },
      'minecraft:crafted': {
        stat: StringNode({ validator: 'resource', params: { pool: 'item' } })
      },
      'minecraft:used': {
        stat: StringNode({ validator: 'resource', params: { pool: 'item' } })
      },
      'minecraft:broken': {
        stat: StringNode({ validator: 'resource', params: { pool: 'item' } })
      },
      'minecraft:picked_up': {
        stat: StringNode({ validator: 'resource', params: { pool: 'item' } })
      },
      'minecraft:dropped': {
        stat: StringNode({ validator: 'resource', params: { pool: 'item' } })
      },
      'minecraft:killed': {
        stat: StringNode({ validator: 'resource', params: { pool: 'entity_type' } })
      },
      'minecraft:killed_by': {
        stat: StringNode({ validator: 'resource', params: { pool: 'entity_type' } })
      },
      'minecraft:custom': {
        stat: StringNode({ validator: 'resource', params: { pool: 'custom_stat' } })
      }
    }
  }))

  schemas.register('player_predicate', ObjectNode({
    gamemode: Opt(StringNode({ enum: 'gamemode' })),
    level: Opt(Range()),
    advancements: Opt(MapNode(
      StringNode({ validator: 'resource', params: { pool: '$advancement' } }),
      ChoiceNode([
        { type: 'boolean', node: BooleanNode(), change: _ => true },
        { 
          type: 'object', node: MapNode(
            StringNode(),
            BooleanNode()
          ) 
        }
      ])
    )),
    recipes: Opt(MapNode(
      StringNode({ validator: 'resource', params: { pool: '$recipe' } }),
      BooleanNode()
    )),
    stats: Opt(ListNode(
      Reference('statistic_predicate')
    ))
  }, { context: 'player' }))

  schemas.register('status_effect_predicate', ObjectNode({
    amplifier: Opt(Range()),
    duration: Opt(Range()),
    ambient: Opt(BooleanNode()),
    visible: Opt(BooleanNode())
  }, { context: 'status_effect' }))

  schemas.register('distance_predicate', ObjectNode({
    x: Opt(Range()),
    y: Opt(Range()),
    z: Opt(Range()),
    absolute: Opt(Range()),
    horizontal: Opt(Range())
  }, { context: 'distance' }))

  schemas.register('entity_predicate', ObjectNode({
    type: Opt(StringNode({ validator: 'resource', params: { pool: 'entity_type', allowTag: true } })),
    nbt: Opt(StringNode({ validator: 'nbt', params: { registry: { category: 'minecraft:entity', id: ['pop', { push: 'type' }] } } })),
    team: Opt(StringNode({ validator: 'team' })),
    location: Opt(Reference('location_predicate')),
    distance: Opt(Reference('distance_predicate')),
    flags: Opt(ObjectNode({
      is_on_fire: Opt(BooleanNode()),
      is_sneaking: Opt(BooleanNode()),
      is_sprinting: Opt(BooleanNode()),
      is_swimming: Opt(BooleanNode()),
      is_baby: Opt(BooleanNode())
    })),
    equipment: Opt(MapNode(
      StringNode({ enum: 'slot' }),
      Reference('item_predicate')
    )),
    player: Opt(Reference('player_predicate')),
    effects: Opt(MapNode(
      StringNode({ validator: 'resource', params: { pool: 'mob_effect' } }),
      Reference('status_effect_predicate')
    ))
  }, { context: 'entity' }))

  schemas.register('damage_source_predicate', ObjectNode({
    is_explosion: Opt(BooleanNode()),
    is_fire: Opt(BooleanNode()),
    is_magic: Opt(BooleanNode()),
    is_projectile: Opt(BooleanNode()),
    is_lightning: Opt(BooleanNode()),
    bypasses_armor: Opt(BooleanNode()),
    bypasses_invulnerability: Opt(BooleanNode()),
    bypasses_magic: Opt(BooleanNode()),
    source_entity: Opt(Reference('entity_predicate')),
    direct_entity: Opt(Reference('entity_predicate'))
  }, { context: 'damage_source' }))

  schemas.register('damage_predicate', ObjectNode({
    dealt: Opt(Range()),
    taken: Opt(Range()),
    blocked: Opt(BooleanNode()),
    source_entity: Opt(Reference('entity_predicate')),
    type: Opt(Reference('damage_source_predicate'))
  }, { context: 'damage' }))
}
