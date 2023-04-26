interface Tag {
  tagId: number;
  tagName: string;
}
interface ExpandedTag {
  tag: Tag;
  selected: boolean;
}
interface User {
  userId: number;
  intraId: string;
  email: string;
  imageUri: string;
  roleType: string;
  totalExp: number;
}
interface Session {
  sessionId: number;
  mentorUser: User | null;
  startTime: string;
  endTime: string;
  tags: Tag[];
}
interface SetSelectableParams {
  startDate: Date;
  tileDate: Date;
  openSlots: Session[];
}
interface IsClampParams {
  rowIndex: number;
  colIndex: number;
  currDate: Date;
  startTime: string;
  endTime: string;
}

type FunctionSetSelectable = (param: SetSelectableParams) => boolean;

type HandleSelect = (rowIndex: number, colIndex: number) => void;

interface SlotTableProps {
  startDate: Date;
  currDate: Date;
  openSlots?: Session[];
  setSelectable: (param: SetSelectableParams) => boolean
  onSelect?: (event: React.MouseEvent, tileDate: Date) => void;
  setTileClassNameList?: (tileDate: Date) => string[];
}

interface CommonProps {
  startDate: Date;
  currDate: Date;
  openSlots: Session[];
  setSelectable: (param: SetSelectableParams) => boolean
  onSelect?: (event: React.MouseEvent, tileDate: Date) => void;
  setTileClassNameList?: (tileInfo: TileInfo) => string[];
}

interface TileInfo {
  rowIndex: number;
  colIndex: number;
  tileDate: Date;
  slots: Session[];
  isSelected: boolean;
  isElapsed: boolean;
  isSelectable: boolean;
}

type FuntionSetTileInfos = React.Dispatch<React.SetStateAction<TileInfo[][]>>;

interface SlotTableBodyProps {
  slotTableProps: CommonProps;
  tileInfos: TileInfo[][];
  setTileInfos: FuntionSetTileInfos;
}

interface SlotTableRowProps {
  rowIndex: number;
  tileInfos: TileInfo[][];
  setTileInfos: FuntionSetTileInfos;
  slotTableProps: CommonProps;
}

interface TileProps {
  tileInfo: TileInfo;
  // tileInfos: TileInfo[][];
  // setTileInfos: FuntionSetTileInfos;
  toggleSelected: (tileInfo: TileInfo) => void
  slotTableProps: CommonProps;
}

interface SlotHeaderProps {
  startDate: Date;
}

type HandleSelect = (rowIndex: number, colIndex: number) => void;