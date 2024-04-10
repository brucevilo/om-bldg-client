import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { InputFile } from '@/Presentation/Component/InputFile';

export default {
    title: 'Common',
    component: InputFile,
} as ComponentMeta<typeof InputFile>;

const Template: ComponentStory<typeof InputFile> = args => (
    <InputFile {...args} />
);

export const アップロードボタン = Template.bind({});
