// Reads where the printed Sheet and its plan sit on screen, so the camera can start exactly over them.

export type Box = { x: number; y: number; w: number; h: number };
export type SheetMeasure = {
  viewport: { w: number; h: number };
  sheet: Box; // layout box of the Sheet, relative to the stage, ignoring transforms
  pxPerUnit: number; // pixels per plan unit at rest
  origin: [number, number]; // stage pixel of the plan's (0, 0)
};

function layoutBox(el: HTMLElement, root: HTMLElement): Box {
  let x = 0, y = 0;
  for (let n: HTMLElement | null = el; n && n !== root; n = n.offsetParent as HTMLElement | null) {
    x += n.offsetLeft;
    y += n.offsetTop;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/** `planUnits` is the plan's width including `pad` on each side, as drawn in the SVG's viewBox. */
export function measureSheet(stageEl: HTMLElement, planUnits: number, pad: number): SheetMeasure | null {
  const sheet = stageEl.querySelector<HTMLElement>("[data-sheet]");
  const plan = stageEl.querySelector<HTMLElement>("[data-plan]");
  if (!sheet || !plan || !plan.offsetWidth) return null;
  const p = layoutBox(plan, stageEl);
  const pxPerUnit = p.w / planUnits;
  return {
    viewport: { w: stageEl.clientWidth, h: stageEl.clientHeight },
    sheet: layoutBox(sheet, stageEl),
    pxPerUnit,
    origin: [p.x + pad * pxPerUnit, p.y + pad * pxPerUnit],
  };
}
