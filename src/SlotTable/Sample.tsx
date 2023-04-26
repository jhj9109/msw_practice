import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SlotTable from './SlotTable';
import { isContinuousSlot, notSlot, setToArr, sortedSlotToTime, updateSelected } from './slotTableUtils';

const ButtonContainer = styled.div`
  width: 100%;
  height: 6vh;
`;

const MenteeMentorSlotsStyle = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5vh;
`;

const Title = styled(Container)`
  height: 5vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  border: 600;
`;

const Calrendar = styled.div`
  background-color: aliceblue;
  height: 75%;
  width: 100%;
  max-height: 55vh;
  overflow: auto;
`;

const MentoringContentContainer = styled.div`
  width: 100%;
  height: 15vh;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;

const Tag = styled.div`
  width: 100%;
  text-align: start;
  font-size: 1.2rem;
  overflow-y: auto;
`;

const TagCheckBox = styled.div`
  display: inline-block;
  margin-right: 1rem;
  overflow-wrap: normal;
`

interface Data {
  startTime: string;
  endTime: string;
  tags: Tag[];
}

const convertExpandedTag = (tags: Tag[]): ExpandedTag[] =>
  tags.map(tag => ({tag, selected: true}));

const isSubmitAvaiable = (tags: ExpandedTag[] | null, selected: Set<number>) =>
  tags?.some((t) => t.selected) && selected.size !== 0

const TagList = ({ tags, onChange }: {tags: ExpandedTag[] | null, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}) => {
  return (
    <Tag>
      {tags?.map(({tag, selected}) => (
        <TagCheckBox key={tag.tagId}>
          <input
            type="checkbox"
            id={tag.tagName}
            name={tag.tagName}
            data-tagid={tag.tagId}
            checked={selected}
            onChange={onChange}
          />
          <label htmlFor={tag.tagName}>{tag.tagName}</label>
        </TagCheckBox>
      ))}
    </Tag>
  )
}

const MenteeMentorSlots = () => {
  const navigator = useNavigate();
  const currDate = new Date();
  const [loading, setLoading] = useState(true);
  
  // axios 요청을 통해? 가져와야할 정보
  const [openSlots, setOpenSlots] = useState<Session[] | null>(null)
  const [tags, setTags] = useState<ExpandedTag[] | null>(null); 
  
  const [selected, setSelected] = useState(() => new Set<number>());
  const [submitAbled, setSubmitAbled] = useState(false);
  
  const handleSelect = (rowIndex: number, colIndex: number) =>
    setSelected((prev) => updateSelected(prev, rowIndex + colIndex * 48))
  
  const onTagSelectedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagId = Number(e.target.getAttribute("data-tagid"))
    setTags(prev =>
      (prev as ExpandedTag[]).map(t =>
        t.tag.tagId === tagId ? {...t, selected: !t.selected} : t))
  }

  const calSubmitAbled = (tags: ExpandedTag[] | null, selected: Set<number>) =>
    !!(selected.size !== 0 && tags?.some((t) => t.selected));
  
  const calIsLoading = (tags: ExpandedTag[] | null, openSlots: Session[] | null) =>
    [tags, openSlots].some(el => el === null);
  
  const slotCompareFn = (el: number, i: number, arr: number[]) =>
    i === 0 || arr[i - 1] + 1 === el
  
  const setData = (sortedSlot: number[], currDate: Date, filterdTags: Tag[]) =>
    ((t: string[], tags): Data =>
      ({startTime: t[0], endTime: t[1], tags}))(
        sortedSlotToTime(sortedSlot, currDate), filterdTags
      );
    
  const onSubmit = () => {
    if (!(isSubmitAvaiable(tags, selected))) {
      alert("올바르지 못한 시도입니다.");
      return;
    }
    const sortedSlot = setToArr(selected).sort((a, b) => a -b);
    const filteredTags = (tags as ExpandedTag[]).filter(t => t.selected).map(t => t.tag);
    if (!isContinuousSlot(sortedSlot, slotCompareFn)) {
      alert("연속된 슬롯만 가능합니다.");
      return;
    }
    const data = setData(sortedSlot, currDate, filteredTags);
    // TODO: 아래를 axios 요청으로 교체하기
    console.log("===============요청 보낼 데이터===============");
    console.log(data);
    // alert("멘토링 슬롯 등록에 성공하였습니다.(테스트용 멘트입니다)");
    // navigator("/");
    console.log("==========================================");
    
    // TODO: axios 요청만들기
    
    postRequest(USER_SESSION_PATH, data)
      .then(res => {
        console.log(res.data);
        alert("멘토링 슬롯 등록에 성공하였습니다.");
        navigator("/");
      })
      .catch(err => {
        console.log(err)
        alert("멘토링 슬롯 등록에 실패하였습니다.");
      })
  }

  // useEffect(() => {
  //   // TODO: axios 요청 
  //   setTimeout(() => setOpenSlots(sampleOpenSlots), 500); // USER_SESSION_PATH & GET
  //   setTimeout(() => setTags(convertExpandedTag(sampleUserTags)), 500); // USER_TAG_PATH & GET
  // }, [])

  useEffect(() => {
    getRequest(USER_SESSION_PATH)
      .then(res => setOpenSlots(res.data as Session[]))
      .catch(err => console.error(err))
  }, [])

  useEffect(() => {
    getRequest(USER_TAG_PATH)
      .then(res => {
        // console.log(res.data.tags);
        setTags(convertExpandedTag(res.data.tags as Tag[]))
      })
      .catch(err => console.error(err))
  }, [])

  useEffect(() => {
    setSubmitAbled(calSubmitAbled(tags, selected));
  }, [tags, selected])

  useEffect(() => {
    setLoading(calIsLoading(tags, openSlots))
  }, [tags, openSlots])
  
  return (
    <MenteeMentorSlotsStyle>
      <Title>멘토링 시간 선택</Title>
      {
        loading ? <div>로딩중</div>
        :
        <>
          <Calrendar>
            <SlotTable
              currDate={currDate}
              openSlots={openSlots}
              isSelectable={notSlot}
              selected={selected}
              onSelect={handleSelect}
            />
          </Calrendar>
          <MentoringContentContainer>
            <TagList tags={tags} onChange={onTagSelectedChange}/>
          </MentoringContentContainer>
          <ButtonContainer>
            <Button size="large" disabled={!submitAbled} onClick={() => onSubmit()}>
              멘토링 시간 선택 완료
            </Button>
          </ButtonContainer>
        </>
      }
    </MenteeMentorSlotsStyle>
  );
};

export default MenteeMentorSlots;