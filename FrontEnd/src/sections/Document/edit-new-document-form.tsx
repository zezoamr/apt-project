import * as Yup from 'yup';
import 'quill/dist/quill.snow.css';
import { useForm } from 'react-hook-form';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useMemo, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import FormProvider, { RHFTextField } from 'src/components/hook-form';
// @mui

import { Quill } from 'react-quill';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
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
  const [docData, setDocData] = useState([...opsData].sort((a, b) => a.pos - b.pos));

  useEffect(() => {
    if (user) {
      ws.send(JSON.stringify({ type: 'join', roomId: 'room1', userid: user.id }));
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

  const onChangeDoc = (value, delta, source) => {
    console.log(delta);
    if (delta.ops[1]?.delete || delta.ops[0].delete) {
      console.log('dlete');
    } else if (delta.ops[0].retain) {
      const diffPos = delta.ops[0].retain;
      console.log(diffPos);
      const prevInsertPos = docData[diffPos].pos;
      console.log(prevInsertPos);
      let nextInsertPos;
      if (diffPos + 1 < docData.length) nextInsertPos = docData[diffPos + 1].pos;
      else nextInsertPos = docData[docData.length - 1].pos;
      console.log(nextInsertPos);
      const insertPos = (prevInsertPos + nextInsertPos) / 2;
      const insertedChar = delta.ops[1].insert;

      ws.send(
        JSON.stringify({
          type: 'insert',
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
        <Typography variant="subtitle2">Title</Typography>
        <RHFTextField name="title" />
        <Card>
          <CardHeader title="Editor " />
          <CardContent>
            <Editor
              id="full-editor"
              defaultValue={getDocFromOperations(opsData)}
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
