# 可视化产物清单模板

每个由脚本生成的图片、网页或报告，都在旁边保存一个同名 `.manifest.json`。复制下面结构并填写真实输入；无对应项写 `null` 或 `not_applicable`，不要估算缺失值。

```json
{
  "artifact_id": "replace-with-stable-artifact-id",
  "artifact_path": "relative/path/to/output",
  "generated_at_hkt": "",
  "inputs": [
    {
      "path": "relative/path/to/structured-data",
      "record_ids": [],
      "sha256": ""
    }
  ],
  "filters": {},
  "time_range": {
    "start": null,
    "end": null
  },
  "currency": {
    "display_currency": "not_applicable",
    "conversion": null
  },
  "generator": {
    "script_path": "relative/path/to/generator",
    "command": "",
    "version_or_commit": ""
  }
}
```

此模板不是一条研究观察；示例字段必须在真实产物中替换。金额图表的 `conversion` 需记录汇率日期、方向和来源；非金额图表保留 `not_applicable`。
