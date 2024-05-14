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
  console.log(user);

  const [docData, setDocData] = useState();

  useEffect(() => {
    if (user) {
      ws.send(JSON.stringify({ type: 'join', roomId: 'room1', userid: user.id }));
      console.log('Connected to the websockets server');
    }
  }, [user]);

  ws.onmessage = (event) => {};

  const params = useParams();
  const { id } = params;
  const newsfeedId = parseInt(id!, 10);
  // console.log(newsfeedId);

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

  const onChangeDoc = (value, delta, source) => {
    console.log(delta);
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
