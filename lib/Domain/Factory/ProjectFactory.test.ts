import { ProjectClassification } from '../Entity';
import { ProjectResponse, ProjectFactory } from './ProjectFactory';

test('レスポンスから企画を作成', () => {
    const res: ProjectResponse = {
        id: 1,
        name: '中ふ頭外２駅トイレリニューアルプロジェクト',
        code: '1000',
        budget: 10000,
        'file_info': {
            path: '/project_file',
            filename: 'xxx.pdf',
        },
        note: '企画のメモ',
        classification: ProjectClassification.InvestmentBudget,
        target_year: 2014,
        'created_at': new Date('2020-01-01').toISOString(),
        'updated_at': new Date('2020-01-02').toISOString(),
    };

    const project = ProjectFactory.createFromResponse(res);
    expect(project.id).toBe(res.id);
    expect(project.name).toBe(res.name);
    expect(project.code).toBe(res.code);
    expect(project.budget).toBe(res.budget);
    expect(project.fileInfo?.path).toBe(res.file_info?.path);
    expect(project.fileInfo?.filename).toBe(res.file_info?.filename);
    expect(project.note).toBe(res.note);
    expect(project.classification).toBe(res.classification);
    expect(project.createdAt.toISOString()).toBe(res.created_at);
    expect(project.updatedAt.toISOString()).toBe(res.updated_at);
});
