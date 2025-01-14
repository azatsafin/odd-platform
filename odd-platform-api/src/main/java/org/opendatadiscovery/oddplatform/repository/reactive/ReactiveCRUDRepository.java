package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveCRUDRepository<POJO> {
    Mono<POJO> get(final long id);

    Mono<Page<POJO>> list(final int page, final int size, final String query);

    Mono<Page<POJO>> list(final int page, final int size, final String query, final List<Long> ids);

    Mono<POJO> create(final POJO pojo);

    Mono<POJO> update(final POJO pojo);

    Flux<POJO> bulkCreate(final Collection<POJO> pojos);

    Flux<POJO> bulkUpdate(final Collection<POJO> pojos);

    Mono<POJO> delete(final long id);
}
