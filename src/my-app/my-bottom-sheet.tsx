import {
  BottomSheet,
  BottomSheetTrigger,
  BottomSheetContent,
  BottomSheetBackdrop,
  BottomSheetDragIndicator,
  BottomSheetItem,
  BottomSheetItemText,
  BottomSheetPortal,
} from '@/components/ui/bottomsheet';
import { Text } from '@/components/ui/text';


interface  MyBottomSheetNumberProps {
    myNumber:string,
}

const MyBottomSheetNumber = ({myNumber}:MyBottomSheetNumberProps) =>  {
  return (
    <BottomSheet>
      <BottomSheetTrigger>
        <Text>Open BottomSheet</Text>
      </BottomSheetTrigger>
      <BottomSheetPortal
        snapPoints={['25%', '50%']}
        backdropComponent={BottomSheetBackdrop}
        handleComponent={BottomSheetDragIndicator}
      >
        <BottomSheetContent>
          <BottomSheetItem>
            <BottomSheetItemText>You have reached number: {myNumber}</BottomSheetItemText>
          </BottomSheetItem>
          <BottomSheetItem>
            <BottomSheetItemText>Item 2</BottomSheetItemText>
          </BottomSheetItem>
          <BottomSheetItem>
            <BottomSheetItemText>Item 3</BottomSheetItemText>
          </BottomSheetItem>
        </BottomSheetContent>
      </BottomSheetPortal>
    </BottomSheet>
  );
}

export default MyBottomSheetNumber;