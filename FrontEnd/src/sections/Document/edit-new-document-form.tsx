import * as Yup from 'yup';
import 'quill/dist/quill.snow.css';
import { useForm } from 'react-hook-form';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useMemo, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import FormProvider from 'src/components/hook-form';
// @mui

import { Quill } from 'react-quill';

import Stack from '@mui/material/Stack';
import { Card, CardHeader, CardContent } from '@mui/material';

// routes
import { useParams } from 'src/routes/hooks';

import { useGetUser } from 'src/api/user';

import Editor from 'src/components/editor';

// ----------------------------------------------------------------------
//
const opsData = [
  {
    char: '',
    pos: 0,
    deleteFlag: false,
    boldFlag: false,
    italicFlag: false,
  },
  {
    char: 'a',
    pos: 500000.0003,
    deleteFlag: false,
    boldFlag: false,
    italicFlag: false,
  },
  {
    char: 's',
    pos: 750000.0004499999,
    deleteFlag: false,
    boldFlag: false,
    italicFlag: false,
  },
  {
    char: 'd',
    pos: 875000.0005249999,
    deleteFlag: false,
    boldFlag: false,
    italicFlag: false,
  },
  {
    char: 's',
    pos: 937500.0005625,
    deleteFlag: false,
    boldFlag: false,
    italicFlag: false,
  },
  {
    char: 'v',
    pos: 968750.00058125,
    deleteFlag: false,
    boldFlag: true,
    italicFlag: false,
  },
  {
    char: 'a',
    pos: 984375.000590625,
    deleteFlag: false,
    boldFlag: true,
    italicFlag: false,
  },
  {
    char: '',
    pos: 1000000,
    deleteFlag: false,
    boldFlag: true,
    italicFlag: false,
  },
];

type Props = {
  currentDocument?: { title: string; content: string } | null;
};

const Delta = Quill.import('delta');

const getDocFromOperations = (ops: any) => {
  const opsDelta = new Delta();
  const sortedData = [...ops].sort((a, b) => a.pos - b.pos);
  sortedData.forEach((item) => {
    opsDelta.insert(item.char, { bold: item.boldFlag, italic: item.italicFlag });
  });
  return opsDelta;
};

const ws = new WebSocket('ws://localhost:8080');

export default function DocsNewEditForm({ currentDocument }: Props) {
  const { user } = useGetUser();
  const params = useParams();
  const { id } = params;
  const newsfeedId = parseInt(id!, 10);
  const [docData, setDocData] = useState<any>([]);
  const [deltaOps, setDeltaOps] = useState<any>();

  useEffect(() => {
    if (user) {
      ws.send(JSON.stringify({ type: 'join', roomId: 'room1', userid: user.id }));
      const sortedData = [...opsData].sort((a, b) => a.pos - b.pos);
      ws.send(JSON.stringify({ type: 'loadData', newdata: sortedData.slice(1, -1) }));

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        if (response.messageType === 'doc') {
          const newData = response.data;
          setDeltaOps(getDocFromOperations(newData));
          const sortedData2 = [...newData].sort((a, b) => a.pos - b.pos);
          setDocData(sortedData2);
        }
      };
      console.log('Connected to the websockets server');
    }
  }, [user]);

  const NewLocationSchema = Yup.object().shape({
    title: Yup.string().required('Please Enter Title'),
    content: Yup.string().required('Please Enter Content'),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentDocument?.title || '',
      content: currentDocument?.content || '',
    }),
    [currentDocument]
  );

  const methods = useForm({
    resolver: yupResolver(NewLocationSchema),
    defaultValues,
  });

  const { reset, setValue, handleSubmit } = methods;
  useEffect(() => {
    if (currentDocument) {
      reset(defaultValues);
    }
  }, [currentDocument, defaultValues, reset, setValue]);

  const onSubmit = handleSubmit(async (data: any) => {
    console.log(data);
  });

  // if (text.length > prevText.length) {
  //             let prevInsertPos = docData[diffPos].pos;
  //             let nextInsertPos;
  //             if (diffPos + 1 < docData.length) nextInsertPos= docData[diffPos + 1].pos;
  //             else nextInsertPos = docData[docData.length - 1].pos;
  //
  //             let insertPos = (prevInsertPos + nextInsertPos) / 2;
  //             let insertedChar = text.slice(diffPos, diffPos + text.length - prevText.length);
  //             ws.send(JSON.stringify({ type: 'insert', chars: insertedChar, pos: insertPos, userid: id, roomId: 'room1',}));
  //
  //         }
  //
  //         // If characters were deleted
  //         else if (text.length < prevText.length) {
  //             let deletePos = (diffPos + 1 < docData.length) ? docData[diffPos + 1].pos : docData[docData.length - 1].pos;
  //             let deletedLength = prevText.length - text.length;
  //             ws.send(JSON.stringify({ type: 'delete', pos: deletePos, length: deletedLength, roomId: 'room1', }));
  //
  // }
  // ws.onmessage = (event) => {
  //     let response = JSON.parse(event.data);
  //     if(response.messageType === 'doc'){
  //         updateQueue.push(() => {
  //             docData = response.data;
  //             let sortedData = [...docData].sort((a, b) => a.pos - b.pos);
  //             let text = sortedData.slice(1, -1).map(item => item.char).join('');
  //             console.log('Updated document:', text);
  //             console.log('Cursor shift:', response.cursorShift);
  //
  //             const prevCursorPos = editor.selectionStart;
  //
  //             // Update textContent
  //             document.getElementById('editor').value = text;
  //
  //             if (response.type === 'insert') {
  //                 updateCursorPosition(response.chars, response.pos, 0, prevCursorPos);
  //             } else if (response.type === 'delete') {
  //                 updateCursorPosition(null, response.pos, response.length, prevCursorPos);
  //             }
  //
  //
  //         });
  //         processUpdateQueue();
  //     }
  //
  // };

  //   const trial_ops = [
  //     { char: 'h', position: 500000, newPos: 500000.0001, userindex: 0, operation: 'insert' },
  //     {
  //       char: 'w',
  //       position: 750000.00005,
  //       newPos: 750000.00015,
  //       userindex: 0,
  //       operation: 'insert',
  //     },
  //   ]; // replace with server call
  //
  //   if (trial_ops.length === 0) {
  //     return;
  //   }
  //   const newdata = [
  //     { char: '', pos: 0, deleteFlag: false, boldFlag: false, italicFlag: false },
  //     { char: '', pos: 1000000, deleteFlag: false, boldFlag: false, italicFlag: false },
  //   ]; // Start token
  //
  //   for (const operation of trial_ops) {
  //     console.log(operation.operation);
  //     if (operation.operation === 'insert') {
  //       operation_insert(operation.char, operation.newPos, newdata);
  //     } else if (operation.operation === 'delete') {
  //       operation_delete(operation.pos, operation.length, newdata);
  //     }
  //   }
  //
  //   ws.send(JSON.stringify({ type: 'loadOperations', operations: trial_ops }));
  // }
  //
  // ws.send(JSON.stringify({ type: 'load', operations: getOperationsFromServer() }));

  const onChangeDoc = (value, delta, source) => {
    console.log(delta);
    if (delta.ops[1]?.delete || delta.ops[0].delete) {
      const diffPos = delta.ops[0]?.retain || 0;
      const deletePos =
        diffPos + 1 < docData.length ? docData[diffPos + 1].pos : docData[docData.length - 1].pos;
      const deletedLength = delta?.ops[1]?.delete || 1;
      ws.send(
        JSON.stringify({ type: 'delete', pos: deletePos, length: deletedLength, roomId: 'room1' })
      );
    } else if (delta.ops[0].retain || (delta.ops[0].insert && delta.ops.length === 1)) {
      const diffPos = delta.ops[0]?.retain || 1;
      const prevInsertPos = docData[diffPos]?.pos || 1000000;
      let nextInsertPos;
      if (diffPos + 1 < docData.length) nextInsertPos = docData[diffPos + 1].pos;
      else nextInsertPos = docData[docData.length - 1].pos;
      const insertPos = (prevInsertPos + nextInsertPos) / 2;
      const insertedChar = delta?.ops[1]?.insert || delta?.ops[0]?.insert;

      ws.send(
        JSON.stringify({
          type: 'insert',
          boldFlag: delta?.ops[1]?.attributes?.bold || false,
          italicFlag: delta?.ops[1]?.attributes?.italic || false,
          chars: insertedChar,
          pos: insertPos,
          userid: user.id,
          roomId: 'room1',
        })
      );
    }
  };

  const onChangeDocCursure = (range, oldRange, source) => {
    if (range) {
      if (range.length === 0) {
        console.log('User cursor is on', range.index);
      }
    } else {
      console.log('Cursor not in the editor');
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={1.5}>
        <Card>
          <CardHeader title="Editor " />
          <CardContent>
            <Editor
              id="full-editor"
              value={deltaOps}
              onChange={(value, delta, source) => {
                onChangeDoc(value, delta, source);
              }}
              onChangeSelection={(range, oldRange, source) => {
                onChangeDocCursure(range, oldRange, source);
              }}
            />
          </CardContent>
        </Card>
      </Stack>
    </FormProvider>
  );
}
