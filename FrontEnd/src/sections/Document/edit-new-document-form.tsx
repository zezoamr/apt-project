import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import FormProvider, { RHFTextField } from 'src/components/hook-form';
// @mui

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// routes
import { useParams } from 'src/routes/hooks';

import RHFEditor from 'src/components/hook-form/rhf-editor';

// hooks

// components

// ----------------------------------------------------------------------

type Props = {
  currentDocument?: { title: string; content: string } | null;
};

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
      </Stack>
      <Stack spacing={1.5}>
        <Typography variant="subtitle2">Content</Typography>
        <RHFEditor name="content" />
      </Stack>
    </FormProvider>
  );
}
