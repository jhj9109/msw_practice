
// const TEXT_COLOR = '#02c4c7';
export const ADJUSTMENT_MINUTES = 15;

export const dayString: { [key: string]: string } = {
  0: 'Mon',
  1: 'Tue',
  2: 'Wed',
  3: 'Thu',
  4: 'Fri',
  5: 'Sat',
  6: 'Sun',
};

export const TILE_STATE = {
  ELAPSED: 1 << 0,
  SLOTS: 1 << 1,
  SELECTABLE: 1 << 2,
  SELECTED: 1 << 3,
};

export const updateSelected = function <T>(prev: Set<T>, el: T) {
  const newSet = new Set(prev);
  if (!newSet.delete(el)) {
    newSet.add(el);
  }
  return newSet;
};

export const getDayString = (day: number) => dayString[day % 7];
export const getHeaderStr = (rowIndex: number) =>
  rowIndex % 2 ? '' : `${rowIndex / 2}:00` + (rowIndex > 24 ? ' pm' : ' am');
export const getHeaderString = (date: Date) =>
  `${getDayString(date.getDay())} ${date
    .toLocaleDateString('ko-kr', { month: 'numeric', day: 'numeric' })
    .replace('. ', '/')
    .replace('.', '')}`;

export const utcOffset = 9 * 60 * 60 * 1000; // UTC+9
export const getKstDate = (date: Date) => new Date(date.getTime() + utcOffset)

export const isClamp = ({rowIndex, colIndex, currDate, startTime, endTime}: IsClampParams) => {
  // 2023-03-17T05:30:17.828Z

  const target = new Date(
      currDate.getFullYear(),
      currDate.getMonth(),
      currDate.getDate() + colIndex,
      Math.floor(rowIndex / 2),
      (rowIndex % 2) * 30
    );
  const start = new Date(startTime)
  const end = new Date(endTime)
  
  const [sTime, tTime, eTime] = [
    start.getTime() / (60 * 1000),
    target.getTime() / (60 * 1000),
    end.getTime() / (60 * 1000)
  ]
  
  return (sTime <= tTime && tTime <= eTime);
}
    

export const isSlot = ({rowIndex, colIndex, openSlots, currDate}: IsSelectableParams) =>
  !!openSlots?.some(session => isClamp({rowIndex, colIndex, currDate, startTime: session.startTime, endTime:session.endTime}))

export const notSlot = ({rowIndex, colIndex, openSlots, startDate}: IsSelectableParams) =>
  !isSlot({rowIndex, colIndex, openSlots, startDate});

export const isElapsed = (rowIndex: number, colIndex: number, startDate: Date) =>
  colIndex === 0 && rowIndex < (startDate.getHours() * 2 + Math.ceil((Number(startDate.getMinutes()) + ADJUSTMENT_MINUTES) / 30));
export const setState = (
  rowIndex: number,
  colIndex: number, 
  startDate: Date,
  openSlots: Session[] | null,
  selected: Set<number>,
  setSelectable: FunctionSetSelectable
): number => {
  const i = rowIndex + colIndex * 48;
  let state = 0;
  if (isElapsed(rowIndex, colIndex, startDate)) {
    state |= TILE_STATE.ELAPSED;
    return state;
  } else {
    // 로딩중setSelectable
    if (openSlots === null) {
      return state;
    }
    // 일단은 전부 셀렉터블
    if (setSelectable({rowIndex, colIndex, openSlots, startDate})) {
      state |= TILE_STATE.SELECTABLE;
    }
    // 셀렉트 여부
    if (selected.has(i)) {
      state |= TILE_STATE.SELECTED;
    }
    // 슬록 여부
    if (isSlot({rowIndex, colIndex, openSlots, startDate})) {
      state |= TILE_STATE.SLOTS;
    }
  }
  return state;
};

/**
 * 타일의 현재 상태에 따라 부여할 class를 string 형태로 반환, 기본 tile && 추가 부여 elapsed | selected | slot
 * @param state 타일의 현재 상태를 나타내는 값, 비트 연산으로 되어 있음
 * @returns className => state에 맞춰 알맞은 class명 부여
 */
export const setTileClass = (state: number) => {
  let className = ['tile'];
  if (state & TILE_STATE.ELAPSED) {
    className.push('elapsed');
    return className;
  }
  if (state & TILE_STATE.SELECTED) {
    className.push('selected');
  }
  if (state & TILE_STATE.SLOTS) {
    className.push('slot');
  }
  return className;
}

export const setToArr = function<T>(s: Set<T>) {
  const arr: T[] = [];
  const iter = s.values();
  for (let i = 0; i < s.size; i++) {
    arr.push(iter.next().value);
  }
  return arr;
}

/**
 * 연속된 슬롯만 허용하기 위해 활용될 뼈대 함수
 * @param sortedSlot 정렬된 슬롯을 받는것으로 가정
 * @param slotCompareFn 연속된 슬롯 여부를 판단하는데 활용될 함수
 * @returns 연속된 슬롯여부를 의미하는 불린값 리턴
 */
export const isContinuousSlot = function <T, U extends (el: T, i: number, arr: T[]) => boolean>(sortedSlot: T[], slotCompareFn: U) {
  return sortedSlot.every(slotCompareFn);
}

/**
 * 첫날 정보와 index를 합쳐 표현되어지는 slot의 시작시간을 Date객체로 반환
 * @param rowIndex AM 0시00분 부터 30분 단위를 나타내는데 활용
 * @param colIndex 요일을 나타내는데 활용
 * @param currDate 기준시간 => 첫날의 연/월/일로 활용
 * @returns Date => index로 표현된 슬롯의 시작 시간을 의미하는 Date 객체 반환
 */
export const indexToDate = (rowIndex: number, colIndex: number, currDate: Date) =>
  new Date(
    currDate.getFullYear(),
    currDate.getMonth(),
    currDate.getDate() + colIndex,
    Math.floor(rowIndex / 2),
    (rowIndex % 2) * 30
  );
export const iToDate = (i: number, currDate: Date) =>
  ((index: number[]) => indexToDate(index[0], index[1], currDate))(iToIndex(i))

/**
 * 슬롯을 나타내는 i를 활용도에 따라 다시 rowIndex와 colIndex로 추출
 * @param i = rowIndex + colIndex * 48
 * @returns [rowIndex, colIndex] => rowIndex = i % 48, colIndex = Math.floor(i / 48)
 */
export const iToIndex = (i: number) => [i % 48, Math.floor(i / 48)];

/**
 * 선택되어진 슬롯의 정보를 서버에 보내기 위해 startTime과 endTime을 추출
 * @param sortedSlot index로 표현되는 슬롯, 연속되어 있어야 유의미한 값 도출
 * @param currDate 첫날을 연/월/일을 의미, index와 함께 슬롯을 표현하는데 활용
 * @returns [startTime, endTime] => kstOffSet을 더한뒤 toISOString()로 생성 (e.g. "2023-03-18T23:00:00.000Z")
 */
export const sortedSlotToTime = (sortedSlot: number[], currDate: Date) => {
  const END_TIME = 1; // endTime의 경우 시작시간이 아닌 끝시간이 필요 => += 1
  const [startI, endI] = [sortedSlot[0], sortedSlot[sortedSlot.length - 1] + END_TIME];
  const [startTime, endTime] = [startI, endI].map((i) => iToDate(i, currDate))
                                              .map(date => getKstDate(date).toISOString())
  return [startTime, endTime];
}