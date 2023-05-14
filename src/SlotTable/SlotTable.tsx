import React, { useState, MouseEvent } from 'react';
import './SlotTable.css';
import { getHeaderStr, getHeaderString, setState, setTileClass, TILE_STATE, updateSelected } from './slotTableUtils';

const HALF_HOURS_IN_DAYS = 48
const DAYS_IN_WEEK = 7
const MINIMUM_INTERVAL_TIME = 0

/**
 * 하루 48개의 half_hours * 일주일 = 236개의 슬롯
 * 슬롯 => 객체로 관리
 * 슬롯을 다루는 캘린더!
 * 
 * 
 */
interface Session {
  sessionId: number;
  mentorUser: User | null;
  startTime: string;
  endTime: string;
  tags: Tag[];
}
const tileInfoInit = (startDate: Date, currDate: Date, openSlots: Session[], setSelectable: FunctionSetSelectable): TileInfo[][] => {
  const calculateTileDate = (rowIndex: number, colIndex: number) => new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate() + colIndex,
    Math.floor(rowIndex / 2),
    (rowIndex % 2) * 30,
  );
  const isDateClamp = (tileDate: Date, startTime: Date, endTime: Date) =>
    startTime.getTime() <= tileDate.getTime() && tileDate.getTime() < endTime.getTime() 
  const newTileInfo = (rowIndex: number, colIndex: number): TileInfo => {
    const tileDate = calculateTileDate(rowIndex, colIndex);
    const isSelected = false;
    const slots = openSlots.filter(session => isDateClamp(tileDate, new Date(session.startTime), new Date(session.endTime)))
    const isElapsed = currDate.getTime() >= tileDate.getTime() + MINIMUM_INTERVAL_TIME
    const isSelectable = setSelectable({startDate, tileDate, openSlots})
    return {rowIndex, colIndex, tileDate, slots, isSelected, isElapsed, isSelectable };
  }
  return Array.from({ length: DAYS_IN_WEEK }).map((_, colIndex) => (
    Array.from({ length: HALF_HOURS_IN_DAYS }).map((_, rowIndex) =>
      newTileInfo(rowIndex, colIndex)
  )))
} 
export default function SlotTable(slotTableProps: SlotTableProps) {
  slotTableProps.openSlots = slotTableProps.openSlots || [];
  // const { startDate, currDate, openSlots, setSelectable, onSelect, setTileClassNameList } = slotTableProps;
  const { startDate, currDate, openSlots, setSelectable } = slotTableProps;
  const [tileInfos, setTileInfos] = useState(() => tileInfoInit(startDate, currDate, openSlots, setSelectable))
  return (
    <div className='tableContainer'>
      <table className="slotTable">
        <SlotTableHeaders startDate={startDate} />
        <SlotTableBody
          tileInfos={tileInfos}
          setTileInfos={setTileInfos}
          slotTableProps={slotTableProps as CommonProps}
        />
      </table>
    </div>
  );
}

/**
 * currDate를 기준으로 일주일간의 헤더를 표시한다.
 */
function SlotTableHeaders({ startDate }: SlotHeaderProps) {
  const year = startDate.getFullYear();
  const month = startDate.getMonth();
  const date = startDate.getDate();

  return (
    <thead>
      <tr>
        <th className='tableHeader'></th>
        {Array.from({ length: DAYS_IN_WEEK }).map((_, index) => (
          <th key={index} className='tableHeader'>
            {getHeaderString(new Date(year, month, (date + index)))}
          </th>
        ))}
      </tr>
    </thead>
  );
}

/**
 * currDate를 기준으로 일주일간의 테이블 바디를 출력한다.
 */
function SlotTableBody({tileInfos, setTileInfos, slotTableProps}: SlotTableBodyProps) {
  // const { startDate, currDate, setSelectable, onSelect, setTileClassNameList} = slotTableProps;
  return (
    <tbody>
      {Array.from({ length: HALF_HOURS_IN_DAYS }).map((_, rowIndex) => (
        <SlotTableRow
          key={rowIndex}
          rowIndex={rowIndex}
          tileInfos={tileInfos}
          setTileInfos={setTileInfos}
          slotTableProps={slotTableProps}
        />
      ))}
    </tbody>
  );
}

function SlotTableRow({rowIndex, tileInfos, setTileInfos, slotTableProps}: SlotTableRowProps) {
  // const { startDate, currDate, setSelectable, onSelect, setTileClassNameList } = slotTableProps;
  const toggleSelected = (tileInfo: TileInfo) => setTileInfos(prev => {
    const copied = Array.from({ length: DAYS_IN_WEEK }).map((_, colIndex) => 
      Array.from({ length: HALF_HOURS_IN_DAYS }).map((_, rowIndex) =>
        ({ ...prev[rowIndex][colIndex] })))
    const { rowIndex, colIndex } = tileInfo
    copied[rowIndex][colIndex].isSelected = !copied[rowIndex][colIndex].isSelected
    return copied;
  })
  return (
    <tr className='tableBody'>
      <RowHeader str={getHeaderStr(rowIndex)} />
      {Array.from({ length: DAYS_IN_WEEK }).map((_, colIndex) => (
        <Tile
          key={colIndex}
          tileInfo={tileInfos[rowIndex][colIndex]}
          toggleSelected={toggleSelected}
          slotTableProps={slotTableProps}
        />
      ))}
    </tr>
  );
}

function RowHeader({ str }: { str: string }) {
  return <td className='rowHeader'>{str}</td>;
}

/**
 * 1. Tile의 클랜스네임을 설정한다.
 * 2. 넘겨받은 onSelect를 실행한다.
 */
function Tile({tileInfo, toggleSelected, slotTableProps}: TileProps) {
  const { tileDate } = tileInfo;
  // const { startDate, currDate, openSlots, setSelectable, onSelect, setTileClassNameList } = slotTableProps;
  const { onSelect, setTileClassNameList } = slotTableProps;
  const setClassNameList = () => {
    const classNameList: string[] = setTileClassNameList ? setTileClassNameList(tileInfo) : [];
    if (tileInfo.isElapsed) {
      classNameList.push('elapsed');
      return classNameList;
    }
    if (tileInfo.isSelectable) {
      classNameList.push('selectable')
    }
    if (tileInfo.isSelected) {
      classNameList.push('selected')
    }
    if (tileInfo.slots.length) {
      classNameList.push('slot')
    }
    return classNameList
  }
  
  const onClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (onSelect) {
      onSelect(event, tileDate);
    }
    toggleSelected(tileInfo)
  }
  return (
    <td
      className={setClassNameList().join(' ')}
      onClick={tileInfo.isSelectable ? onClick : undefined}
    />
  )
}