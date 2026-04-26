import { AuditTable } from 'features/audit/ui/AuditTable/AuditTable';
import { useGetAllAuditLogsQuery } from 'features/audit/api/auditApi';
import { NewsAdminBlock } from 'features/news/manage-news/ui/NewsAdminBlock';
import { CreateNewsForm } from 'features/news/create-news/ui/CreateNewsForm';
import cls from './AdminPage.module.scss';

const AdminPage = () => {
    const { data, isLoading } = useGetAllAuditLogsQuery();

    return (
        <div className={cls.adminPage}>
            <header className={cls.pageHeader}>
                <h1 className={cls.pageTitle}>Панель администратора</h1>
                <p className={cls.pageSubtitle}>
                    Аудит действий и управление публикациями
                </p>
            </header>

            <div className={cls.grid}>
                <aside className={cls.left}>
                    <CreateNewsForm />
                </aside>

                <div className={cls.right}>
                    <section className={cls.newsSection} aria-labelledby="admin-news-heading">
                        <h2 id="admin-news-heading" className={cls.sectionTitle}>
                            Список новостей
                        </h2>
                        <div className={cls.newsInner}>
                            <NewsAdminBlock />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
