import { StoryObj, Meta } from '@storybook/react-webpack5';
import { useForm, FormProvider } from 'react-hook-form';
import FormInput from './FormInput';

const meta: Meta<typeof FormInput> = {
    title: 'shared/ui/FormInput',
    component: FormInput,
    tags: ['autodocs'],
    parameters:{
        layout: 'centered',
    },
    decorators: [
        (Story) => {
            const methods = useForm({
                defaultValues: { test: '' },
            });
            return (
                <FormProvider {...methods}>
                    <div style={{ width: 400 }}>
                        <Story />
                    </div>
                </FormProvider>
            );
        },

    ],
};

export default meta;

type Story = StoryObj<typeof FormInput>;

export const Email: Story = {
    args: {
        name: 'email',
        type: 'email',
        placeholder: 'ваша почта',
    },
};
