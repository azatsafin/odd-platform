package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Table;
import org.jooq.UpdateResultStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import reactor.core.publisher.Mono;

public abstract class ReactiveAbstractSoftDeleteCRUDRepository<R extends Record, P>
    extends ReactiveAbstractCRUDRepository<R, P> {

    private static final String DEFAULT_DELETED_FIELD = "is_deleted";
    private static final String DEFAULT_DELETED_AT_FIELD = "deleted_at";

    protected final Field<Boolean> deletedField;
    protected final Field<LocalDateTime> deletedAtField;

    public ReactiveAbstractSoftDeleteCRUDRepository(final JooqReactiveOperations jooqReactiveOperations,
                                                    final JooqQueryHelper jooqQueryHelper,
                                                    final Table<R> recordTable,
                                                    final Class<P> pojoClass) {
        super(jooqReactiveOperations, jooqQueryHelper, recordTable, pojoClass);

        this.deletedField = recordTable.field(DEFAULT_DELETED_FIELD, Boolean.class);
        this.deletedAtField = recordTable.field(DEFAULT_DELETED_AT_FIELD, LocalDateTime.class);
    }

    public ReactiveAbstractSoftDeleteCRUDRepository(final JooqReactiveOperations jooqReactiveOperations,
                                                    final JooqQueryHelper jooqQueryHelper,
                                                    final Table<R> recordTable,
                                                    final Class<P> pojoClass,
                                                    final Field<String> nameField,
                                                    final Field<Long> idField,
                                                    final Field<LocalDateTime> updatedAtField,
                                                    final Field<Boolean> deletedField,
                                                    final Field<LocalDateTime> deletedAtField) {
        super(jooqReactiveOperations, jooqQueryHelper, recordTable, pojoClass, nameField, idField, updatedAtField);

        this.deletedField = deletedField;
        this.deletedAtField = deletedAtField;
    }

    @Override
    public Mono<P> delete(final long id) {
        final Map<Field<?>, Object> updatedFieldsMap = getDeleteChangedFields();
        final UpdateResultStep<R> query = DSL.update(recordTable)
            .set(updatedFieldsMap)
            .where(idCondition(id))
            .returning();

        return jooqReactiveOperations.mono(query).map(this::recordToPojo);
    }

    @Override
    protected List<Condition> idCondition(final long id) {
        return addSoftDeleteFilter(super.idCondition(id));
    }

    protected List<Condition> listCondition(final String nameQuery) {
        return addSoftDeleteFilter(super.listCondition(nameQuery));
    }

    @Override
    protected List<Condition> listCondition(final String nameQuery, final List<Long> ids) {
        return addSoftDeleteFilter(super.listCondition(nameQuery, ids));
    }

    protected List<Condition> addSoftDeleteFilter(final Condition condition) {
        return addSoftDeleteFilter(List.of(condition));
    }

    protected List<Condition> addSoftDeleteFilter(final List<Condition> conditions) {
        final List<Condition> conditionsList = new ArrayList<>(conditions);
        conditionsList.add(deletedField.isFalse());
        return conditionsList;
    }

    protected Map<Field<?>, Object> getDeleteChangedFields() {
        final Map<Field<?>, Object> updatedFieldsMap = new HashMap<>();
        updatedFieldsMap.put(deletedField, true);
        if (deletedAtField != null) {
            updatedFieldsMap.put(deletedAtField, LocalDateTime.now());
        }
        return updatedFieldsMap;
    }
}
