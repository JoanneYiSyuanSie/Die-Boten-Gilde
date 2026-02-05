# DLC Content Directory

Place your generated DLC content files (JSON or TypeScript) in this folder.

## Naming Convention
Use `[dlc_code].ts` or `[dlc_code].json`.
Example: `chp1.ts` or `chp1.json`.

## Structure
The file should export a `MissionData` object (see `types.ts`).

## How to Register
After adding a file here, you must:
1.  Open `c:\Web\die-boten-gilde\constants\shopItems.ts`.
2.  Add a new item to `SHOP_ITEMS` with `type: 'dlc_item'`.
3.  Update the `DLC_CODE_MAP` in `c:\Web\die-boten-gilde\utils\licenseUtils.ts`.
