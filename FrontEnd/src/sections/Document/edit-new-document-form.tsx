import * as Yup from 'yup';
import 'quill/dist/quill.snow.css';
import { useForm } from 'react-hook-form';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import FormProvider, { RHFTextField } from 'src/components/hook-form';
// @mui

import { Quill } from 'react-quill';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Card, CardHeader, CardContent } from '@mui/material';

// routes
import { useParams } from 'src/routes/hooks';

import Editor from 'src/components/editor';

// ----------------------------------------------------------------------

type Props = {
  currentDocument?: { title: string; content: string } | null;
};
const Delta = Quill.import('delta');
export default function DocsNewEditForm({ currentDocument }: Props) {
  const params = useParams();

  const { id } = params;
  const newsfeedId = parseInt(id!, 10);
  console.log(newsfeedId);

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
              defaultValue={new Delta()
                .insert('Some ')
                .insert('initial', { bold: true })
                .insert(' ')
                .insert('content', { italic: true })
                .insert('\n')}
              onChange={(value, delta, source) => {
                console.log(value);
                console.log(delta);
                console.log(source);
              }}
              onChangeSelection={(range, oldRange, source) => {
                if (range) {
                  if (range.length === 0) {
                    console.log('User cursor is on', range.index);
                  }
                } else {
                  console.log('Cursor not in the editor');
                }
              }}
            />
          </CardContent>
        </Card>
      </Stack>
    </FormProvider>
  );
}
