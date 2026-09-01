-- Lets a project opt into a manually-set (drag-to-reorder) product/service
-- order instead of the default alphabetical listing. trades.sort_order
-- already exists and is used to persist that manual order.
alter table projects add column use_custom_trade_order boolean not null default false;
