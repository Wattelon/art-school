$(function () {
    const hideAll = () => {
        $('#add-form, #edit-form-container, #deleteButton').hide();
        $('.edit-btn, .delete-checkbox').hide();
    };

    $('#show-add-form').click(() => {
        hideAll();
        $('#news-unified-list').hide();
        $('#add-form').show();
    });

    $('#show-edit-list').click(() => {
        hideAll();
        $('#news-unified-list').show();
        $('.edit-btn').show();
    });

    $('#show-delete-list').click(() => {
        hideAll();
        $('#news-unified-list').show();
        $('.delete-checkbox').show();
        $('#deleteButton').show();
    });

    $('#news-unified-list').show();

    $('#addNewsForm').on('submit', function (e) {
        e.preventDefault();
        $.post('/admin/news/add', $(this).serialize(), function (res) {
            alert(res.message);
            location.reload();
        }).fail(() => alert('Ошибка при добавлении'));
    });

    $('.edit-btn').on('click', function () {
        const id = $(this).closest('.news-card').data('id');
        $.getJSON(`/admin/news/${id}`, function (news) {
            $('#edit-id').val(news.id);
            $('#edit-title').val(news.title);
            $('#edit-content').val(news.content);
            $('#edit-image').val(news.image_url);

            $('#edit-form-container').show();
        }).fail(() => alert('Ошибка загрузки новости'));
    });

    $('#editNewsForm').on('submit', function (e) {
        e.preventDefault();
        const id = $('#edit-id').val();
        $.post(`/admin/news/edit/${id}`, $(this).serialize(), function (res) {
            alert(res.message);
            location.reload();
        }).fail(() => alert('Ошибка при редактировании'));
    });

    $('#edit-cancel').on('click', function () {
        $('#edit-form-container').hide();
    });

    $('#deleteForm').on('submit', function (e) {
        e.preventDefault();
        $.post('/admin/news/delete', $(this).serialize(), function (res) {
            alert(res.message);
            location.reload();
        }).fail(err => {
            alert('Ошибка при удалении: ' + err.responseText);
        });
    });
});
