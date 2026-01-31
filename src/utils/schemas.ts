import * as v from 'valibot';

export const MetadataValueSchema = v.union([v.string(), v.number(), v.boolean(), v.null_()]);

export const NodeSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  text: v.string(),
  level: v.pipe(v.number(), v.minValue(0), v.maxValue(10)),
  rank: v.number(),
  checked: v.boolean(),
  collapsed: v.optional(v.boolean(), false),
  parentId: v.nullable(v.string()),
  updatedAt: v.number(),
  metadata: v.optional(v.record(v.string(), MetadataValueSchema), {})
});

export type ValidatedNode = v.InferOutput<typeof NodeSchema>;
